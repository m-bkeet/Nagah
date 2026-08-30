/**
 * NAGAH MS - Universal Identifier & Safe QR/Barcode Service
 * Implements Entity ID, Human-readable Code, QR Token, and Barcode Value abstraction.
 * Enforces Safe QR design (safe lookup tokens; no raw secret data).
 */

export interface UniversalIdentifier {
  entityId: string;
  entityType: 'STUDENT' | 'TRAINER' | 'BRANCH' | 'COURSE' | 'GROUP' | 'ENROLLMENT' | 'DEVICE' | 'RECEIPT' | 'EXAM' | 'CERTIFICATE' | 'TRANSACTION';
  humanCode: string; // e.g., A001, NELB11A001R3
  qrToken: string;   // safe lookup token e.g., nagah_qr_st_A001_8a9f2b
  barcodeValue: string; // EAN/Code128 compatible string e.g., 2026001001
  safePayload?: Record<string, any>;
}

/**
 * Generates a safe lookup QR token for an entity.
 */
export function generateSafeQrToken(entityType: string, humanCode: string, entityId: string): string {
  const cleanType = entityType.toLowerCase().substring(0, 4);
  const cleanCode = humanCode.replace(/[^a-zA-Z0-9]/g, '');
  const salt = entityId.substring(0, 6);
  return `ngh_${cleanType}_${cleanCode}_${salt}`;
}

/**
 * Generates a barcode value representation.
 */
export function generateBarcodeValue(entityType: string, humanCode: string): string {
  const numericOnly = humanCode.replace(/\D/g, '');
  const padded = numericOnly.padStart(6, '0');
  const typeCode = entityType === 'STUDENT' ? '10' : entityType === 'RECEIPT' ? '20' : entityType === 'CERTIFICATE' ? '30' : '90';
  return `${typeCode}${padded}`;
}

/**
 * Constructs a Universal Identifier for any major entity.
 */
export function buildUniversalIdentifier(
  entityType: UniversalIdentifier['entityType'],
  entityId: string,
  humanCode: string,
  extraPayload?: Record<string, any>
): UniversalIdentifier {
  const qrToken = generateSafeQrToken(entityType, humanCode, entityId);
  const barcodeValue = generateBarcodeValue(entityType, humanCode);

  return {
    entityId,
    entityType,
    humanCode,
    qrToken,
    barcodeValue,
    safePayload: {
      type: entityType,
      code: humanCode,
      system: 'NAGAH MS',
      verifiable: true,
      ...extraPayload,
    },
  };
}
