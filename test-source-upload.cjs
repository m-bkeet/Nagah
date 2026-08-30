const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function testUpload() {
  console.log("1. Creating real Delta Sync ZIP package...");
  const zip = new AdmZip();

  const manifest = {
    packageId: "NAGAH-DELTA-2026-08-28-001",
    version: "2.0.0",
    packageType: "INCREMENTAL_DELTA_SYNC",
    createdAt: new Date().toISOString(),
    sourceSystem: "Legacy Firebase Firestore",
    targetSystem: "NAGAH Supabase PostgreSQL",
    entityCounts: {
      students: 154,
      attendance: 342,
      payments: 91,
      courses: 18,
      groups: 12
    },
    checksumSha256: "auto"
  };

  // 154 student records
  const students = Array.from({ length: 154 }, (_, i) => ({
    studentCode: `STU-${1000 + i}`,
    fullName: `Student Record ${i + 1}`,
    phone: `+96650000${String(i).padStart(4, '0')}`,
    nationalId: `10${String(i).padStart(8, '0')}`,
    status: i < 5 ? "NEW" : (i < 7 ? "UPDATED" : "ACTIVE"),
    enrolledAt: "2026-01-15T08:00:00Z",
    pointsBalance: 100 + (i * 10)
  }));

  // 342 attendance records
  const attendance = Array.from({ length: 342 }, (_, i) => ({
    id: `ATT-${2000 + i}`,
    studentCode: `STU-${1000 + (i % 154)}`,
    sessionDate: "2026-08-20",
    status: "PRESENT",
    verifiedAt: new Date().toISOString()
  }));

  // 91 payment records
  const payments = Array.from({ length: 91 }, (_, i) => ({
    receiptNumber: `REC-${5000 + i}`,
    studentCode: `STU-${1000 + (i % 154)}`,
    amount: 750.00,
    paymentMethod: "CASH",
    paidAt: "2026-08-25T14:30:00Z"
  }));

  // 18 courses
  const courses = Array.from({ length: 18 }, (_, i) => ({
    id: `CRS-${100 + i}`,
    code: `CRS-${100 + i}`,
    title: `Course Module ${i + 1}`,
    durationWeeks: 8
  }));

  // 12 groups
  const groups = Array.from({ length: 12 }, (_, i) => ({
    id: `GRP-${10 + i}`,
    name: `Batch Group ${i + 1}`,
    courseId: `CRS-${100 + (i % 18)}`
  }));

  zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf-8"));
  zip.addFile("students.json", Buffer.from(JSON.stringify(students, null, 2), "utf-8"));
  zip.addFile("attendance.json", Buffer.from(JSON.stringify(attendance, null, 2), "utf-8"));
  zip.addFile("payments.json", Buffer.from(JSON.stringify(payments, null, 2), "utf-8"));
  zip.addFile("courses.json", Buffer.from(JSON.stringify(courses, null, 2), "utf-8"));
  zip.addFile("groups.json", Buffer.from(JSON.stringify(groups, null, 2), "utf-8"));

  const zipBuffer = zip.toBuffer();
  console.log(`Generated ZIP Buffer size: ${zipBuffer.length} bytes`);

  const base64Payload = zipBuffer.toString("base64");

  console.log("2. Uploading payload to backend: POST /api/migration/upload-package");
  const response = await fetch("http://localhost:3000/api/migration/upload-package", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: "NAGAH_DELTA_SYNC_2026-08-28.zip",
      fileSize: zipBuffer.length,
      packageType: "INCREMENTAL_DELTA_SYNC",
      fileBase64: base64Payload
    })
  });

  const json = await response.json();
  console.log("Upload response:", JSON.stringify(json, null, 2));

  console.log("\n3. Testing GET /api/migration/source-status");
  const statusRes = await fetch("http://localhost:3000/api/migration/source-status");
  const statusJson = await statusRes.json();
  console.log("Source status:", JSON.stringify(statusJson, null, 2));

  console.log("\n4. Testing GET /api/migration/db-check (Preconditions Gate)");
  const checkRes = await fetch("http://localhost:3000/api/migration/db-check");
  const checkJson = await checkRes.json();
  console.log("DB & Gate Check:", JSON.stringify(checkJson, null, 2));

  console.log("\n5. Testing POST /api/migration/delta-merge (Preconditions ONLY / dryRun)");
  const mergeRes = await fetch("http://localhost:3000/api/migration/delta-merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      batchId: "NAGAH-DELTA-2026-08-28-001",
      dryRun: true,
      validatePreconditionsOnly: true
    })
  });
  const mergeJson = await mergeRes.json();
  console.log("Delta Merge Gate Preconditions Response:", JSON.stringify(mergeJson, null, 2));
}

testUpload().catch(console.error);
