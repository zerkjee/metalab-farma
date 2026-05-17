import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ erro: "Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF." }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ erro: "Arquivo muito grande. Máximo 5MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: "metalab/produtos",
      transformation: [{ width: 1200, height: 1200, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    logger.error("Falha no upload Cloudinary", error)
    return NextResponse.json({ erro: "Erro ao fazer upload" }, { status: 500 })
  }
}
