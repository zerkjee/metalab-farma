'use client';

import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics';
import { useSession } from 'next-auth/react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';
import PixPending from '@/components/checkout/PixPending';
import CriarContaPrompt from '@/components/checkout/CriarContaPrompt';
import OrderSummary from '@/components/checkout/OrderSummary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { calculateCartTotals } from '@/services/cartTotals';
import { fmtCurrency } from '@/utils/formatters';
import { salvarPedidoLocal } from '@/lib/pedidosLocais';
import type {
  CheckoutForm as CheckoutFormValues,
  CheckoutStage,
  FreteStatus,
  PaymentMethod,
  PaymentMethodId,
  RealOrder,
  ShippingMethod,
  ShippingMethodId,
} from '@/types/checkout';

const initialForm: CheckoutFormValues = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  zipCode: '',
  address: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

const checkoutFormId = 'metalab-checkout-form';

const initialShippingMethods: ShippingMethod[] = [
  { id: 'standard', label: 'Entrega padrão',   description: 'Envio nacional com rastreio via Correios.', price: 0, estimate: '' },
  { id: 'express',  label: 'Entrega expressa', description: 'Prioridade na separação e no envio.',       price: 0, estimate: '' },
];

// Cartão e Boleto ainda não têm backend — ficam visíveis mas desabilitados
const paymentMethods: PaymentMethod[] = [
  {
    id: 'PIX',
    label: 'PIX',
    description: 'Confirmação instantânea. QR Code gerado após o pedido.',
    disabled: false,
  },
  {
    id: 'CARTAO_CREDITO',
    label: 'Cartão de Crédito',
    description: 'Parcelamento em breve.',
    disabled: true,
  },
  {
    id: 'BOLETO',
    label: 'Boleto',
    description: 'Em breve.',
    disabled: true,
  },
];

export default function CheckoutPage() {
  const {
    items,
    coupons,
    hydrated,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { data: session } = useSession();
  const [form, setForm] = useState<CheckoutFormValues>(initialForm);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<ShippingMethodId>('standard');
  // PIX é o único método habilitado
  const [selectedPaymentId] = useState<PaymentMethodId>('PIX');
  // Máquina de estados do checkout
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>({ stage: 'form' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<{ codigo: string; tipo: string; valor: number }[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(initialShippingMethods);
  const [freteStatus, setFreteStatus] = useState<FreteStatus>('idle');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [enderecoMode, setEnderecoMode] = useState<'salvo' | 'novo'>('salvo');
  const [temEnderecoSalvo, setTemEnderecoSalvo] = useState(false);
  const savedFormRef = useRef<CheckoutFormValues | null>(null);
  const beginCheckoutFired = useRef(false);
  const cartSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Snapshot do pedido para o trackPurchase, preenchido só quando confirmado
  const pendingTrackRef = useRef<{ orderId: string; total: number } | null>(null);
  // Gerada uma vez por carregamento da página de checkout; reenviada em todo
  // retry de finishOrder() pra que o servidor detecte duplo-submit/retry de rede
  // e devolva o pedido já criado em vez de criar outro (ver /api/pedidos).
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    fetch('/api/user/perfil')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || data.erro) return;
        const cpfFormatado = data.cpf
          ? data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          : '';
        const telFormatado = data.telefone
          ? data.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          : '';
        const e = data.enderecoPrincipal;
        const preenchido: CheckoutFormValues = {
          fullName: data.nome ?? '',
          email: data.email ?? '',
          cpf: cpfFormatado,
          phone: telFormatado,
          zipCode: e ? e.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '',
          address: e?.logradouro ?? '',
          number: e?.numero ?? '',
          complement: e?.complemento ?? '',
          district: e?.bairro ?? '',
          city: e?.cidade ?? '',
          state: e?.estado ?? '',
        };
        savedFormRef.current = preenchido;
        setForm(preenchido);
        if (e) setTemEnderecoSalvo(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cupons/disponiveis')
      .then((r) => r.json())
      .then((data) => { if (!cancelled && Array.isArray(data)) setCuponsDisponiveis(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const digits = form.zipCode.replace(/\D/g, '');

    void (async () => {
      if (digits.length !== 8) {
        if (!cancelled) {
          setFreteStatus('idle');
          setShippingMethods(initialShippingMethods);
        }
        return;
      }
      if (!cancelled) setFreteStatus('loading');
      try {
        const res = await fetch('/api/frete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cep: digits,
            itens: items.map((i) => ({ produtoId: i.productId, quantidade: i.quantity })),
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setShippingMethods(data as ShippingMethod[]);
          setSelectedShippingId(data[0].id as ShippingMethodId);
          setFreteStatus('done');
        } else {
          setFreteStatus('error');
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== 'AbortError') setFreteStatus('error');
      }
    })();

    return () => { cancelled = true; controller.abort(); };
  }, [form.zipCode, items]);

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingId) ?? shippingMethods[0],
    [selectedShippingId, shippingMethods],
  );
  const totals = useMemo(() => calculateCartTotals({
    items,
    coupons,
    shippingPrice: selectedShipping.price,
  }), [coupons, items, selectedShipping.price]);

  useEffect(() => {
    if (!hydrated || items.length === 0 || beginCheckoutFired.current) return;
    beginCheckoutFired.current = true;
    trackBeginCheckout(totals.total, items.reduce((s, i) => s + i.quantity, 0));
  }, [hydrated, items, totals.total]);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) return;

    if (cartSaveTimer.current) clearTimeout(cartSaveTimer.current);
    cartSaveTimer.current = setTimeout(() => {
      void fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          nome: form.fullName || undefined,
          itens: items.map((i) => ({ nome: i.name, quantidade: i.quantity, precoUnit: i.unitPrice })),
          total: totals.total,
          cupomCodigo: coupons.discount?.code ?? undefined,
        }),
      });
    }, 3000);

    return () => { if (cartSaveTimer.current) clearTimeout(cartSaveTimer.current); };
  }, [form.email, form.fullName, items, totals.total, coupons.discount, hydrated]);

  const appliedCoupons = useMemo(
    () => [coupons.discount, coupons.freeShipping].filter((coupon) => coupon !== null),
    [coupons.discount, coupons.freeShipping],
  );

  function handleEnderecoModeChange(mode: 'salvo' | 'novo') {
    setEnderecoMode(mode);
    if (mode === 'salvo' && savedFormRef.current) {
      setForm(savedFormRef.current);
    } else if (mode === 'novo') {
      setForm((f) => ({ ...f, zipCode: '', address: '', number: '', complement: '', district: '', city: '', state: '' }));
      setFreteStatus('idle');
      setShippingMethods(initialShippingMethods);
    }
  }

  function cupomLabel(c: { tipo: string; valor: number }) {
    if (c.tipo === 'FRETE_GRATIS') return 'Frete grátis';
    if (c.tipo === 'PERCENTUAL') return `${c.valor}% off`;
    return `R$${c.valor.toFixed(2).replace('.', ',')} off`;
  }

  async function aplicarCupomChip(codigo: string) {
    setCouponCode(codigo);
    setCouponMessage(null);
    const result = await applyCoupon(codigo);
    setCouponMessage({ type: result.ok ? 'success' : 'error', text: result.message });
    if (result.ok) setCouponCode('');
  }

  function updateForm<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Chamado pelo PixPending quando polling confirma pago: true
  function handlePixConfirmed() {
    if (checkoutStage.stage !== 'pending_pix') return;
    const order = checkoutStage.order;

    // Só aqui limpa o carrinho e dispara analytics — pagamento realmente confirmado
    clearCart();
    if (pendingTrackRef.current) {
      trackPurchase({
        orderId: pendingTrackRef.current.orderId,
        value: pendingTrackRef.current.total,
        items: [], // itens já foram limpos do cart
      });
    }

    setCheckoutStage({ stage: 'confirmed', order });
  }

  async function finishOrder() {
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        itens: items.map((item) => ({
          produtoId: item.productId.startsWith('local-') ? undefined : item.productId,
          slug: item.slug,
          quantidade: item.quantity,
        })),
        cliente: {
          nome: form.fullName,
          email: form.email,
          cpf: form.cpf.replace(/\D/g, ''),
          telefone: form.phone,
        },
        endereco: {
          cep: form.zipCode.replace(/\D/g, ''),
          logradouro: form.address,
          numero: form.number,
          complemento: form.complement || undefined,
          bairro: form.district,
          cidade: form.city,
          estado: form.state,
        },
        frete: { servicoId: selectedShipping.id },
        cupomCodigo: coupons.discount?.code ?? undefined,
        cupomFreteCodigo: coupons.freeShipping?.code ?? undefined,
        metodoPagamento: selectedPaymentId,
        idempotencyKey: idempotencyKeyRef.current,
      };

      // 1. Cria o pedido
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.erro ?? 'Erro ao criar pedido. Tente novamente.');
        return;
      }

      // Acompanhamento local (convidado): guarda a referência do pedido neste navegador,
      // para que apareça em "Meus pedidos" mesmo sem login.
      salvarPedidoLocal({ id: data.pedidoId, numero: data.pedidoNumero });

      // 2. Cria pagamento PIX no Mercado Pago
      let pixQrCode: string | undefined;
      let pixQrCodeBase64: string | undefined;

      if (selectedPaymentId === 'PIX') {
        const pixRes = await fetch('/api/pagamento/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: data.pedidoId }),
        });

        if (!pixRes.ok) {
          // PIX falhou — o pedido foi cancelado e o estoque devolvido no servidor.
          setSubmitError(
            'Não foi possível processar o pagamento. Tente novamente.',
          );
          return;
        }

        const pixData = await pixRes.json();
        pixQrCode = pixData.qrCode;
        pixQrCodeBase64 = pixData.qrCodeBase64;
      }

      const order: RealOrder = {
        id: data.pedidoId,
        numero: data.pedidoNumero,
        total: data.total,
        metodoPagamento: selectedPaymentId,
        pixQrCode,
        pixQrCodeBase64,
        customer: form,
        shipping: selectedShipping,
        coupons: appliedCoupons,
      };

      // Guarda referência para o trackPurchase que será disparado só na confirmação
      pendingTrackRef.current = { orderId: data.pedidoId, total: data.total };

      // 3. Avança para estado de PIX pendente — NÃO limpa carrinho nem dispara analytics aqui
      setCheckoutStage({ stage: 'pending_pix', order });
    } catch {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    const result = await applyCoupon(couponCode.trim().toUpperCase());
    setCouponMessage({ type: result.ok ? 'success' : 'error', text: result.message });
    if (result.ok) setCouponCode('');
  }

  // ── Roteamento por estágio ────────────────────────────────────────────────

  if (checkoutStage.stage === 'pending_pix') {
    return (
      <>
        <Header />
        <main className="bg-surface-page px-4 py-14 sm:px-6 lg:px-8">
          <PixPending order={checkoutStage.order} onConfirmed={handlePixConfirmed} />
          {!session?.user && <CriarContaPrompt customer={checkoutStage.order.customer} />}
        </main>
        <Footer />
      </>
    );
  }

  if (checkoutStage.stage === 'confirmed') {
    return (
      <>
        <Header />
        <main className="bg-surface-page px-4 py-14 sm:px-6 lg:px-8">
          <CheckoutSuccess order={checkoutStage.order} />
          {!session?.user && <CriarContaPrompt customer={checkoutStage.order.customer} />}
        </main>
        <Footer />
      </>
    );
  }

  if (!hydrated) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center bg-surface-page px-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-navy/15" />
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="bg-surface-page px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-navy">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.7} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy">Checkout</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy">Seu carrinho está vazio</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-secondary">
              Adicione produtos ao carrinho antes de finalizar o pedido.
            </p>
            <Link
              href="/#produtos"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
            >
              Voltar para loja
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Formulário de checkout ──────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="bg-surface-page">
        <section className="border-b border-line bg-surface-card px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <Link href="/#produtos" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-ink-secondary transition-colors hover:text-navy">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Continuar comprando
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy">Checkout</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">Finalize seu pedido</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
                Pagamento processado com segurança via Mercado Pago.
              </p>
            </div>
          </div>
        </section>

        {submitError && (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          </div>
        )}

        {/* Resumo colapsável — visível apenas em mobile */}
        <div className="lg:hidden mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface-card shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm"
              aria-expanded={summaryOpen}
            >
              <span className="font-semibold text-ink">
                {summaryOpen ? 'Ocultar resumo' : `Ver resumo (${items.length} ${items.length === 1 ? 'item' : 'itens'})`}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-navy">{fmtCurrency(totals.total)}</span>
                <svg
                  className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {summaryOpen && (
              <div className="border-t border-line px-4 pb-4 pt-3 space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-ink truncate flex-1 pr-2">{item.name} <span className="text-ink-muted">×{item.quantity}</span></span>
                    <span className="font-semibold text-ink shrink-0">{fmtCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-line flex justify-between text-sm font-display font-semibold text-navy">
                  <span>Total</span>
                  <span>{fmtCurrency(totals.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Cupons</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-navy">Aplique seus benefícios</h2>
                <p className="mt-1 text-sm text-ink-secondary">Permitido 1 cupom de desconto + 1 cupom de frete grátis.</p>
              </div>

              {cuponsDisponiveis.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Cupons disponíveis — clique para aplicar</p>
                  <div className="flex flex-wrap gap-2">
                    {cuponsDisponiveis.map((c) => {
                      const jaAplicado =
                        coupons.discount?.code === c.codigo || coupons.freeShipping?.code === c.codigo;
                      return (
                        <button
                          key={c.codigo}
                          type="button"
                          disabled={jaAplicado}
                          onClick={() => aplicarCupomChip(c.codigo)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                            jaAplicado
                              ? 'border-success/30 bg-success-subtle text-success cursor-default'
                              : 'border-brand/30 bg-brand-subtle text-brand-700 hover:bg-brand-100 cursor-pointer'
                          }`}
                        >
                          <span>{c.codigo}</span>
                          <span className="opacity-70">·</span>
                          <span>{cupomLabel(c)}</span>
                          {jaAplicado && <span className="ml-0.5">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Ou digite um código"
                  className="min-w-0 flex-1 rounded-xl border border-line-default bg-surface-sunken px-3 py-3 text-sm font-bold uppercase tracking-wide text-ink outline-none placeholder:text-ink-muted focus:border-brand focus:bg-surface-card"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
                >
                  Aplicar cupom
                </button>
              </div>
              {couponMessage && (
                <p className={`mt-3 text-sm font-semibold ${
                  couponMessage.type === 'success' ? 'text-success' : 'text-danger'
                }`}>
                  {couponMessage.text}
                </p>
              )}
              {(coupons.discount || coupons.freeShipping) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {coupons.discount && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-success-subtle px-3 py-1.5 text-xs font-bold text-success">
                      {coupons.discount.code}
                      <button type="button" onClick={() => removeCoupon('discount')} className="text-danger">remover</button>
                    </span>
                  )}
                  {coupons.freeShipping && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-success-subtle px-3 py-1.5 text-xs font-bold text-success">
                      {coupons.freeShipping.code}
                      <button type="button" onClick={() => removeCoupon('free_shipping')} className="text-danger">remover</button>
                    </span>
                  )}
                </div>
              )}
            </section>

            <CheckoutForm
              formId={checkoutFormId}
              values={form}
              shippingMethods={shippingMethods}
              paymentMethods={paymentMethods}
              selectedShippingId={selectedShippingId}
              selectedPaymentId={selectedPaymentId}
              freteStatus={freteStatus}
              logado={!!session?.user}
              temEnderecoSalvo={temEnderecoSalvo}
              enderecoMode={enderecoMode}
              onEnderecoModeChange={handleEnderecoModeChange}
              onChange={updateForm}
              onShippingChange={setSelectedShippingId}
              onPaymentChange={() => { /* somente PIX habilitado */ }}
              onSubmit={finishOrder}
            />
          </div>
          <OrderSummary
            formId={checkoutFormId}
            items={items}
            subtotal={totals.subtotal}
            shippingTotal={selectedShipping.price}
            discountTotal={totals.discountTotal}
            shippingDiscountTotal={totals.shippingDiscountTotal}
            payableShippingTotal={totals.payableShippingTotal}
            total={totals.total}
            coupons={coupons}
            freteStatus={freteStatus}
            submitting={submitting}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
