import AppKit
import Foundation
import PDFKit
import Vision

struct OCRLine: Codable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
}

struct OCRPage: Codable {
    let number: Int
    let lines: [OCRLine]
}

struct OCRDocument: Codable {
    let file: String
    let pages: [OCRPage]
}

func cgImage(from image: NSImage) -> CGImage? {
    var proposedRect = CGRect(origin: .zero, size: image.size)
    return image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil)
}

func recognize(page: PDFPage, pageNumber: Int) throws -> OCRPage {
    let bounds = page.bounds(for: .mediaBox)
    let targetSize = NSSize(width: max(bounds.width * 2.5, 1800), height: max(bounds.height * 2.5, 2400))
    let thumbnail = page.thumbnail(of: targetSize, for: .mediaBox)

    guard let image = cgImage(from: thumbnail) else {
        throw NSError(domain: "OCR", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not render page \(pageNumber)"])
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = ["pt-BR", "en-US"]
    request.minimumTextHeight = 0.006

    let handler = VNImageRequestHandler(cgImage: image, options: [:])
    try handler.perform([request])

    let observations = request.results ?? []
    let lines = observations.compactMap { observation -> OCRLine? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let box = observation.boundingBox
        return OCRLine(
            text: candidate.string.trimmingCharacters(in: .whitespacesAndNewlines),
            confidence: candidate.confidence,
            x: box.minX,
            y: box.maxY
        )
    }
    .filter { !$0.text.isEmpty }
    .sorted {
        if abs($0.y - $1.y) > 0.012 { return $0.y > $1.y }
        return $0.x < $1.x
    }

    return OCRPage(number: pageNumber, lines: lines)
}

guard CommandLine.arguments.count >= 3 else {
    FileHandle.standardError.write(Data("Usage: swift scripts/ocr-fichas.swift INPUT_DIR OUTPUT_JSON\n".utf8))
    exit(2)
}

let inputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputFile = URL(fileURLWithPath: CommandLine.arguments[2])
let fileManager = FileManager.default
let resourceKeys: Set<URLResourceKey> = [.isRegularFileKey, .nameKey]

let pdfFiles = fileManager.enumerator(
    at: inputDirectory,
    includingPropertiesForKeys: Array(resourceKeys),
    options: [.skipsHiddenFiles]
)?.compactMap { $0 as? URL }
    .filter { $0.pathExtension.lowercased() == "pdf" }
    .sorted { $0.path.localizedCaseInsensitiveCompare($1.path) == .orderedAscending } ?? []

var documents: [OCRDocument] = []

for (index, fileURL) in pdfFiles.enumerated() {
    let relativePath = fileURL.path.replacingOccurrences(of: inputDirectory.path + "/", with: "")
    FileHandle.standardError.write(Data("[\(index + 1)/\(pdfFiles.count)] \(relativePath)\n".utf8))

    guard let document = PDFDocument(url: fileURL) else {
        FileHandle.standardError.write(Data("  skipped: unreadable PDF\n".utf8))
        continue
    }

    var pages: [OCRPage] = []
    for pageIndex in 0..<document.pageCount {
        guard let page = document.page(at: pageIndex) else { continue }
        do {
            pages.append(try recognize(page: page, pageNumber: pageIndex + 1))
        } catch {
            FileHandle.standardError.write(Data("  page \(pageIndex + 1) failed: \(error.localizedDescription)\n".utf8))
        }
    }
    documents.append(OCRDocument(file: relativePath, pages: pages))
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
let data = try encoder.encode(documents)
try fileManager.createDirectory(at: outputFile.deletingLastPathComponent(), withIntermediateDirectories: true)
try data.write(to: outputFile, options: .atomic)
print("Wrote \(documents.count) documents to \(outputFile.path)")
