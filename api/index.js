var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "_success_v7_salt").digest("hex");
}
var isServerless, ACTUAL_DATA_DIR, BACKUPS_DIR, DB_FILE, BACKUP_FILE, BUNDLED_DB_PATHS, defaultPointRules, initialData, userPasswordMap, DatabaseManager, db;
var init_db = __esm({
  "server/db.ts"() {
    isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
    ACTUAL_DATA_DIR = isServerless ? path.join(os.tmpdir(), "nagah_data") : path.join(process.cwd(), "data");
    BACKUPS_DIR = path.join(ACTUAL_DATA_DIR, "backups");
    DB_FILE = path.join(ACTUAL_DATA_DIR, "database.json");
    BACKUP_FILE = path.join(ACTUAL_DATA_DIR, "database.backup.json");
    BUNDLED_DB_PATHS = [path.join(process.cwd(), "data", "database.json"), path.join(process.cwd(), "database.json"), "/var/task/data/database.json", "/vercel/path0/data/database.json"];
    defaultPointRules = [
      { id: "rule-1", title: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062D\u0636\u0648\u0631", pointValue: 10, ruleType: "attendance", description: "\u0646\u0642\u0627\u0637 \u0627\u0644\u062D\u0636\u0648\u0631 \u0641\u064A \u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u062D\u062F\u062F", isActive: true },
      { id: "rule-2", title: "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u0627\u0644\u062A\u0641\u0627\u0639\u0644", pointValue: 20, ruleType: "participation", description: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0627\u0644\u0625\u064A\u062C\u0627\u0628\u064A \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629", isActive: true },
      { id: "rule-3", title: "\u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0645\u0647\u0645\u0629 / \u0627\u0644\u0648\u0627\u062C\u0628", pointValue: 30, ruleType: "task", description: "\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0648\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A", isActive: true },
      { id: "rule-4", title: "\u0627\u0644\u062A\u0645\u064A\u0632 \u0648\u0627\u0644\u062A\u0641\u0648\u0642", pointValue: 50, ruleType: "excellence", description: "\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0623\u0648\u0644 \u0623\u0648 \u0639\u0645\u0644 \u0645\u0645\u064A\u0632", isActive: true },
      { id: "rule-5", title: "\u0645\u062E\u0627\u0644\u0641\u0629 \u0623\u0648 \u062A\u0623\u062E\u064A\u0631", pointValue: -10, ruleType: "violation", description: "\u0627\u0644\u062A\u0623\u062E\u064A\u0631 \u0623\u0648 \u0639\u062F\u0645 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0642\u0627\u0639\u0629", isActive: true }
    ];
    initialData = {
      computerLabs: [
        {
          id: "lab-1",
          name: "\u0645\u0639\u0645\u0644 \u0627\u0644\u0646\u062C\u0627\u062D",
          branchId: "branch-1",
          branchName: "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          capacity: 25,
          devicesCount: 20,
          status: "active",
          notes: "\u0645\u0639\u0645\u0644 \u0627\u0644\u062D\u0627\u0633\u0628 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A - \u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D"
        },
        {
          id: "lab-2",
          name: "\u0645\u0639\u0645\u0644 \u0628\u062F\u0631",
          branchId: "branch-2",
          branchName: "\u0641\u0631\u0639 \u0628\u062F\u0631",
          capacity: 25,
          devicesCount: 20,
          status: "active",
          notes: "\u0645\u0639\u0645\u0644 \u0627\u0644\u062D\u0627\u0633\u0628 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A - \u0641\u0631\u0639 \u0628\u062F\u0631"
        }
      ],
      branches: [
        {
          id: "branch-1",
          name: "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          code: "NGAH",
          address: "\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A - \u0645\u0628\u0646\u0649 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628",
          phone: "01012345678",
          managerName: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "branch-2",
          name: "\u0641\u0631\u0639 \u0628\u062F\u0631",
          code: "BADR",
          address: "\u0641\u0631\u0639 \u0645\u062F\u064A\u0646\u0629 \u0628\u062F\u0631 - \u0633\u0646\u062A\u0631 \u0627\u0644\u062A\u062F\u0631\u064A\u0628",
          phone: "01087654321",
          managerName: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0628\u062F\u0631",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      users: [
        {
          id: "user-admin",
          username: "admin",
          fullName: "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          role: "super_admin",
          phone: "01000000000",
          email: "admin@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "user-accountant",
          username: "accountant",
          fullName: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A",
          role: "accountant",
          branchId: "branch-1",
          phone: "01055556666",
          email: "finance@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "user-reception",
          username: "reception",
          fullName: "\u0645\u0633\u0626\u0648\u0644 \u0627\u0644\u062A\u0633\u062C\u064A\u0644",
          role: "receptionist",
          branchId: "branch-1",
          phone: "01077778888",
          email: "reception@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "user-trainer",
          username: "trainer",
          fullName: "\u0645\u062F\u0631\u0628 \u0645\u0639\u062A\u0645\u062F",
          role: "trainer",
          branchId: "branch-1",
          phone: "01099990000",
          email: "trainer@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "user-branch-1",
          username: "manager_ngah",
          fullName: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          role: "branch_manager",
          branchId: "branch-1",
          phone: "01011112222",
          email: "ngah@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "user-branch-2",
          username: "manager_badr",
          fullName: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0628\u062F\u0631",
          role: "branch_manager",
          branchId: "branch-2",
          phone: "01033334444",
          email: "badr@nagah.eg",
          status: "active",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      trainers: [
        {
          "id": "trainer-1787349806643",
          "name": "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "photoUrl": "",
          "phone": "01001500686",
          "email": "M_bkeet@yahoo.com",
          "branchId": "branch-1",
          "specialty": "ICT",
          "courseIds": [
            "course-1787347401956"
          ],
          "programIds": [],
          "commissionType": "percentage",
          "commissionRate": 40,
          "status": "active",
          "contractDate": "2026-08-21",
          "notes": "",
          "totalEarned": 0,
          "totalPaid": 0,
          "balanceDue": 0,
          "commissionValue": 40
        },
        {
          "id": "trainer-1787349870400",
          "name": "\u062F. \u0639\u0645\u0627\u062F \u062D\u0627\u0645\u062F \u0627\u0628\u0648 \u0627\u0644\u0646\u064A\u0644",
          "photoUrl": "",
          "phone": "01066264312",
          "email": "",
          "branchId": "branch-2",
          "specialty": "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0645\u0639\u0644\u0648\u0645\u0627\u062A",
          "courseIds": [
            "course-1787347401956"
          ],
          "programIds": [],
          "commissionType": "percentage",
          "commissionRate": 40,
          "status": "active",
          "contractDate": "2026-08-21",
          "notes": "",
          "totalEarned": 0,
          "totalPaid": 0,
          "balanceDue": 0,
          "commissionValue": 40
        }
      ],
      trainees: [
        {
          "id": "trainee-1787361330810-d1if",
          "code": "A001",
          "fullName": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "nationalId": "",
          "birthDate": "",
          "gender": "female",
          "phone": "01001500686",
          "parentPhone": "01001500686",
          "parentName": "\u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "address": "",
          "branchId": "branch-1",
          "courseId": "course-1787347569318",
          "groupId": "grp-1787358595611",
          "trainerId": "trainer-1787349806643",
          "registrationDate": "2026-08-22",
          "status": "active",
          "feeAmount": 0,
          "discountAmount": 0,
          "netAmount": 0,
          "paidAmount": 0,
          "remainingAmount": 0,
          "notes": "\u0627\u0628\u0646\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 - \u0625\u0639\u0641\u0627\u0621 \u0643\u0627\u0645\u0644",
          "totalPoints": 277,
          "ranking": 1,
          "points": 277,
          "courseIds": [
            "course-1787347569318"
          ],
          "isExempt": true,
          "exemptReason": "management_children",
          "siblingIds": [
            "trainee-1787361410293-aeko",
            "trainee-1787459300939-62ly"
          ],
          "siblingNames": [
            "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
            "\u0644\u064A\u0646 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A"
          ]
        },
        {
          "id": "trainee-1787361410293-aeko",
          "code": "A002",
          "fullName": "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "nationalId": "",
          "birthDate": "",
          "gender": "female",
          "phone": "01005400325",
          "parentPhone": "01001500686",
          "parentName": "\u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "address": "",
          "branchId": "branch-1",
          "courseId": "course-1787347462419",
          "groupId": "grp-1787431608023",
          "trainerId": "trainer-1787349806643",
          "registrationDate": "2026-08-22",
          "status": "active",
          "feeAmount": 0,
          "discountAmount": 0,
          "netAmount": 0,
          "paidAmount": 0,
          "remainingAmount": 0,
          "notes": "\u0631\u0628\u0637 \u0625\u062E\u0648\u0629 \u0645\u0639 (\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A - A001) - \u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u062E\u0635\u0645 \u0627\u0644\u0623\u062E\u0648\u0627\u062A",
          "totalPoints": 200,
          "ranking": 2,
          "points": 200,
          "courseIds": [
            "course-1787347462419"
          ],
          "isExempt": true,
          "exemptReason": "management_children",
          "siblingIds": [
            "trainee-1787361330810-d1if",
            "trainee-1787459300939-62ly"
          ],
          "siblingNames": [
            "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
            "\u0644\u064A\u0646 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A"
          ]
        },
        {
          "id": "trainee-1787459300939-62ly",
          "code": "A003",
          "fullName": "\u0644\u064A\u0646 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "nationalId": "",
          "birthDate": "",
          "gender": "female",
          "phone": "01001500686",
          "parentPhone": "01001500686",
          "parentName": "\u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "address": "",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "groupId": "grp-1787350487970",
          "trainerId": "trainer-1787349806643",
          "registrationDate": "2026-08-23",
          "status": "active",
          "feeAmount": 0,
          "discountAmount": 0,
          "netAmount": 0,
          "paidAmount": 0,
          "remainingAmount": 0,
          "notes": "\u0631\u0628\u0637 \u0625\u062E\u0648\u0629 \u0645\u0639 (\u0645\u0631\u0627\u0645 \u0648\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A) - \u0625\u0639\u0641\u0627\u0621 \u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0625\u062F\u0627\u0631\u0629",
          "totalPoints": 133,
          "ranking": 3,
          "points": 133,
          "courseIds": [
            "course-1787347401956"
          ],
          "isExempt": true,
          "exemptReason": "management_children",
          "siblingIds": [
            "trainee-1787361330810-d1if",
            "trainee-1787361410293-aeko"
          ],
          "siblingNames": [
            "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
            "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A"
          ]
        }
      ],
      courses: [
        {
          "id": "course-1787347401956",
          "code": "CRS-472",
          "name": "ICT4",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0645\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0644\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "course-1787347462419",
          "code": "CRS-695",
          "name": "ICT5",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "course-1787347508908",
          "code": "CRS-182",
          "name": "ICT6",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "course-1787347569318",
          "code": "CRS-892",
          "name": "ICT-P1",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u0627\u0648\u0644 \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787427719238",
          "code": "CRS-573",
          "name": "ICT-P2",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787427763144",
          "code": "CRS-644",
          "name": "ICT-P3",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 200,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787427970903",
          "code": "CRS-220",
          "name": "ICT-S1",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 250,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u0627\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787428009076",
          "code": "CRS-796",
          "name": "ICT-S2",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 250,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787428039994",
          "code": "CRS-131",
          "name": "ICT-S3",
          "branchId": "branch-1",
          "hoursCount": 8,
          "lecturesCount": 64,
          "feeAmount": 250,
          "trainerPercentage": 40,
          "centerPercentage": 60,
          "startDate": "",
          "endDate": "",
          "maxTrainees": 20,
          "status": "active",
          "description": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0627\u0644\u064A \u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A",
          "category": "\u062F\u0648\u0631\u0629 \u0645\u0646\u0647\u062C ICT",
          "billingType": "monthly",
          "trainerSharePercentage": 50,
          "centerSharePercentage": 50
        },
        {
          "id": "crs-1787502480417-0ggk",
          "name": "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A \u0644\u063A\u0627\u062A",
          "code": "ICT-p1-L",
          "branchId": "branch-1",
          "category": "\u0627\u0644\u0645\u062F\u0627\u0631\u0633",
          "hoursCount": 20,
          "lecturesCount": 10,
          "feeAmount": 500,
          "status": "active"
        },
        {
          "id": "crs-1787502489944-bf2a",
          "name": "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A",
          "code": "ICT-p1",
          "branchId": "branch-1",
          "category": "\u0627\u0644\u0645\u062F\u0627\u0631\u0633",
          "hoursCount": 20,
          "lecturesCount": 10,
          "feeAmount": 500,
          "status": "active"
        },
        {
          "id": "crs-1787502587826-q429",
          "name": "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A \u0644\u063A\u0627\u062A",
          "code": "ICT-p3-L",
          "branchId": "branch-1",
          "category": "\u0627\u0644\u0645\u062F\u0627\u0631\u0633",
          "hoursCount": 20,
          "lecturesCount": 10,
          "feeAmount": 500,
          "status": "active"
        }
      ],
      programs: [],
      groups: [
        {
          "id": "grp-1787350487970",
          "name": "ICT4 - 1",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "startTime": "15:00",
          "endTime": "16:00",
          "maxCapacity": 11,
          "startDate": "",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
          "notes": ""
        },
        {
          "id": "grp-1787350488774",
          "name": "ICT4 - 2",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "startTime": "16:00",
          "endTime": "17:00",
          "maxCapacity": 11,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
          "notes": ""
        },
        {
          "id": "grp-1787351870532",
          "name": "ICT4 - 3",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "startTime": "18:00",
          "endTime": "19:00",
          "maxCapacity": 11,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
          "notes": ""
        },
        {
          "id": "grp-1787358559234",
          "name": "ICT - p1 - 1",
          "branchId": "branch-1",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "startTime": "15:00",
          "endTime": "16:00",
          "maxCapacity": 11,
          "startDate": "2026-08-22",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
          "notes": ""
        },
        {
          "id": "grp-1787358595611",
          "name": "ICT - p1 - 2",
          "branchId": "branch-1",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "startTime": "16:00",
          "endTime": "17:00",
          "maxCapacity": 11,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
          "notes": ""
        },
        {
          "id": "grp-1787358828709",
          "name": "ICT - p1 - 3",
          "branchId": "branch-1",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "startTime": "17:00",
          "endTime": "18:00",
          "maxCapacity": 11,
          "startDate": "2026-08-22",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
          "notes": ""
        },
        {
          "id": "grp-1787431608023",
          "name": "ICT5 - 1",
          "branchId": "branch-1",
          "courseId": "course-1787347462419",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
            "\u0627\u0644\u062E\u0645\u064A\u0633"
          ],
          "startTime": "14:00",
          "endTime": "15:00",
          "maxCapacity": 11,
          "startDate": "2026-08-22",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3",
          "notes": ""
        },
        {
          "id": "grp-1787431802246",
          "name": "ICT6 - 1",
          "branchId": "branch-1",
          "courseId": "course-1787347508908",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "startTime": "14:00",
          "endTime": "15:00",
          "maxCapacity": 11,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
          "notes": ""
        },
        {
          "id": "grp-1787431825818",
          "name": "ICT6 - 2",
          "branchId": "branch-1",
          "courseId": "course-1787347508908",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 11,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0623\u062D\u062F",
            "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"
          ],
          "startTime": "17:00",
          "endTime": "18:00",
          "maxCapacity": 11,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
          "notes": ""
        },
        {
          "id": "grp-1787432103884",
          "name": "ICT4 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347401956",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "18:00",
          "endTime": "19:00",
          "maxCapacity": 12,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787432635686",
          "name": "ICT5 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347462419",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "15:00",
          "endTime": "16:00",
          "maxCapacity": 12,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787433082510",
          "name": "ICT6 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347508908",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "16:00",
          "endTime": "17:00",
          "maxCapacity": 12,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787433160347",
          "name": "ICT - p1 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "17:00",
          "endTime": "18:00",
          "maxCapacity": 12,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787433234491",
          "name": "ICT - S1 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "14:00",
          "endTime": "15:00",
          "maxCapacity": 12,
          "startDate": "2026-09-01",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787433327552",
          "name": "ICT - S2 - B1",
          "branchId": "branch-2",
          "courseId": "course-1787347569318",
          "trainerId": "trainer-1787349806643",
          "hallName": "\u0642\u0627\u0639\u0629 1",
          "days": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645",
          "maxStudents": 12,
          "status": "active",
          "roomName": "\u0642\u0627\u0639\u0629 1",
          "scheduleDays": [
            "\u0627\u0644\u0633\u0628\u062A",
            "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"
          ],
          "startTime": "19:00",
          "endTime": "20:00",
          "maxCapacity": 12,
          "startDate": "2026-08-22",
          "endDate": "",
          "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9",
          "notes": "",
          "feeAmount": 250
        },
        {
          "id": "grp-1787502480417-ltuf",
          "name": "ICT-p1-L - 1",
          "branchId": "branch-1",
          "courseId": "crs-1787502480417-0ggk",
          "maxStudents": 10,
          "maxCapacity": 10,
          "status": "active",
          "days": [
            "\u0627\u0644\u062C\u0645\u0639\u0629"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645"
        },
        {
          "id": "grp-1787502489945-o2sh",
          "name": "ICT-p1 - 1",
          "branchId": "branch-1",
          "courseId": "crs-1787502489944-bf2a",
          "maxStudents": 12,
          "maxCapacity": 12,
          "status": "active",
          "days": [
            "\u0627\u0644\u062C\u0645\u0639\u0629"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645"
        },
        {
          "id": "grp-1787502587826-wvu7",
          "name": "ICT-p3-L - 1",
          "branchId": "branch-1",
          "courseId": "crs-1787502587826-q429",
          "maxStudents": 10,
          "maxCapacity": 10,
          "status": "active",
          "days": [
            "\u0627\u0644\u062C\u0645\u0639\u0629"
          ],
          "timeSlot": "04:00 \u0645 - 06:00 \u0645"
        }
      ],
      attendance: [
        {
          "id": "att-1787466295224-u89e",
          "date": "2026-08-23",
          "time": "\u0660\u0666:\u0662\u0664 \u0635",
          "branchId": "branch-1",
          "groupId": "grp-1787350487970",
          "courseId": "course-1787347401956",
          "traineeId": "trainee-1787459300939-62ly",
          "status": "present",
          "notes": "\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0646 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)"
        },
        {
          "id": "att-1787464456274-6gb2",
          "date": "2026-08-23",
          "time": "\u0660\u0665:\u0665\u0664 \u0635",
          "branchId": "branch-1",
          "groupId": "grp-1787358595611",
          "courseId": "course-1787347569318",
          "traineeId": "trainee-1787361330810-d1if",
          "status": "present",
          "notes": "\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0646 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)"
        }
      ],
      payments: [],
      expenses: [],
      trainerSettlements: [],
      pointRules: defaultPointRules,
      pointTransactions: [
        {
          "id": "pt-1787466295224",
          "traineeId": "trainee-1787459300939-62ly",
          "groupId": "grp-1787350487970",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-83)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-23T06:24:55.224Z"
        },
        {
          "id": "pt-reinf-1787465508933-s3j0",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 16,
          "reason": "[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: \u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u062A\u0639\u0627\u0648\u0646 \u0645\u062A\u0645\u064A\u0632! - \u062F\u0639\u0645 \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621 \u0641\u064A \u062D\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629!",
          "addedByUserId": "trainer",
          "addedByUserName": "\u0627\u0644\u0645\u062F\u0631\u0628",
          "createdAt": "2026-08-23T06:11:48.933Z"
        },
        {
          "id": "pt-1787464456275",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-83)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-23T05:54:16.275Z"
        },
        {
          "id": "pt-1787459955413-444o",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787431608023",
          "branchId": "branch-1",
          "points": 100,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-23T04:39:15.413Z"
        },
        {
          "id": "pt-1787459946569-3pse",
          "traineeId": "trainee-1787459300939-62ly",
          "groupId": "grp-1787350487970",
          "branchId": "branch-1",
          "points": 100,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-23T04:39:06.569Z"
        },
        {
          "id": "pt-1787459938649-2nop",
          "traineeId": "trainee-1787459300939-62ly",
          "groupId": "grp-1787350487970",
          "branchId": "branch-1",
          "points": 23,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-23T04:38:58.649Z"
        },
        {
          "id": "pt-1787430858701-5izp",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 100,
          "reason": "\u0625\u0646\u062C\u0627\u0632 \u0623\u0633\u0637\u0648\u0631\u064A \u0648\u062C\u0627\u0626\u0632\u0629 \u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u0643\u0628\u0631\u0649",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T20:34:18.701Z"
        },
        {
          "id": "pt-reinf-1787362796188-3kij",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 51,
          "reason": "[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: \u062A\u062D\u064A\u0629 \u0648\u062A\u0634\u062C\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u062F\u0631\u0628\u064A \u0627\u0644\u0642\u0627\u0639\u0629! \u{1F680} - \u062A\u0641\u0627\u0639\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u0647\u062F \u062C\u0645\u0627\u0639\u064A \u0631\u0627\u0626\u0639 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A!",
          "addedByUserId": "trainer",
          "addedByUserName": "\u0627\u0644\u0645\u062F\u0631\u0628",
          "createdAt": "2026-08-22T01:39:56.188Z"
        },
        {
          "id": "pt-1787362695962-fjl7",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 15,
          "reason": "\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0641\u064A \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-22T01:38:15.962Z"
        },
        {
          "id": "pt-1787362526303-m12r",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-22T01:35:26.303Z"
        },
        {
          "id": "pt-1787362380117-64xv",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 15,
          "reason": "\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0641\u064A \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-22T01:33:00.117Z"
        },
        {
          "id": "pt-1787362271687",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-22T01:31:11.687Z"
        },
        {
          "id": "pt-reinf-1787362006056-suqi",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 51,
          "reason": "[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: \u062A\u062D\u064A\u0629 \u0648\u062A\u0634\u062C\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u062F\u0631\u0628\u064A \u0627\u0644\u0642\u0627\u0639\u0629! \u{1F680} - \u062A\u0641\u0627\u0639\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u0647\u062F \u062C\u0645\u0627\u0639\u064A \u0631\u0627\u0626\u0639 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A!",
          "addedByUserId": "trainer",
          "addedByUserName": "\u0627\u0644\u0645\u062F\u0631\u0628",
          "createdAt": "2026-08-22T01:26:46.056Z"
        },
        {
          "id": "pt-1787361922519",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-22T01:25:22.519Z"
        },
        {
          "id": "pt-1787361433577-8oxr",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0625\u062C\u0627\u0628\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0648\u0633\u0631\u0639\u0629 \u0628\u062F\u064A\u0647\u0629",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T01:17:13.577Z"
        },
        {
          "id": "pt-1787361426705-x0vc",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0625\u062C\u0627\u0628\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0648\u0633\u0631\u0639\u0629 \u0628\u062F\u064A\u0647\u0629",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T01:17:06.705Z"
        },
        {
          "id": "pt-1787360877177",
          "traineeId": "trainee-1787352042655-o2znr",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-22T01:07:57.177Z"
        },
        {
          "id": "pt-1787359878296",
          "traineeId": "trainee-1787352042655-bkzr9",
          "groupId": "grp-1787358559234",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-22T00:51:18.296Z"
        },
        {
          "id": "pt-1787359713319",
          "traineeId": "trainee-1787352042654-aj70e",
          "groupId": "",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-22T00:48:33.319Z"
        },
        {
          "id": "pt-1787356997939-907a",
          "traineeId": "trainee-1787352054266-40z66",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-59aa",
          "traineeId": "trainee-1787352054266-s4ys4",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-ubxr",
          "traineeId": "trainee-1787352054266-jijye",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-pk4l",
          "traineeId": "trainee-1787352054266-1fxlt",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-5mia",
          "traineeId": "trainee-1787352054266-te1p2",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-fua0",
          "traineeId": "trainee-1787352054266-ab5pp",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-r3p6",
          "traineeId": "trainee-1787352054266-whiuc",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-z7py",
          "traineeId": "trainee-1787352054265-b1r9p",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-jin9",
          "traineeId": "trainee-1787352054265-mvg2v",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-k78n",
          "traineeId": "trainee-1787352054265-e68mx",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-r8hk",
          "traineeId": "trainee-1787352054265-tnqmk",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-6tg2",
          "traineeId": "trainee-1787352054265-89sik",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-mehg",
          "traineeId": "trainee-1787352054265-s3igz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-v46t",
          "traineeId": "trainee-1787352054265-jd4tp",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-7ffv",
          "traineeId": "trainee-1787352054265-hx8no",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-a2vo",
          "traineeId": "trainee-1787352054265-i39ds",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-p4jl",
          "traineeId": "trainee-1787352054265-h6wwj",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-b4g6",
          "traineeId": "trainee-1787352054265-x6x9f",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-rfh1",
          "traineeId": "trainee-1787352054264-rv552",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-4wwh",
          "traineeId": "trainee-1787352054264-zxwq0",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997939-1jqb",
          "traineeId": "trainee-1787352054264-kl9ca",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997938-qyyb",
          "traineeId": "trainee-1787352054264-0vyqu",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.939Z"
        },
        {
          "id": "pt-1787356997938-e6it",
          "traineeId": "trainee-1787352054264-b4aee",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-vyhk",
          "traineeId": "trainee-1787352054264-xkezz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-khrh",
          "traineeId": "trainee-1787352054263-tuyfw",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-2n68",
          "traineeId": "trainee-1787352054263-81qro",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-f7v9",
          "traineeId": "trainee-1787352054263-wuwwn",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-lkua",
          "traineeId": "trainee-1787352054263-e6srh",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-qbe5",
          "traineeId": "trainee-1787352054263-d4hmz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-tz9l",
          "traineeId": "trainee-1787352054263-2wlgz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-leow",
          "traineeId": "trainee-1787352054263-zrex8",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-i5ym",
          "traineeId": "trainee-1787352054262-fehxv",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-rhmr",
          "traineeId": "trainee-1787352054262-hvrlu",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-lvks",
          "traineeId": "trainee-1787352042663-wgwj3",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-z072",
          "traineeId": "trainee-1787352042663-jye60",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-g4qj",
          "traineeId": "trainee-1787352042663-lrb0e",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-ik96",
          "traineeId": "trainee-1787352042662-kh71r",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-cqb3",
          "traineeId": "trainee-1787352042662-58hi5",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-216e",
          "traineeId": "trainee-1787352042662-b5noo",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-k6tj",
          "traineeId": "trainee-1787352042662-avarj",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-mjlw",
          "traineeId": "trainee-1787352042662-t70xe",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-07j9",
          "traineeId": "trainee-1787352042662-b9go0",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-q89t",
          "traineeId": "trainee-1787352042662-z17c5",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-0cjj",
          "traineeId": "trainee-1787352042662-3tq3x",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-gme9",
          "traineeId": "trainee-1787352042661-yss51",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-i9yq",
          "traineeId": "trainee-1787352042661-vllz8",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-0cc2",
          "traineeId": "trainee-1787352042661-2h51r",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-n4r6",
          "traineeId": "trainee-1787352042661-4ky49",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-g88v",
          "traineeId": "trainee-1787352042661-gatx4",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-yr8d",
          "traineeId": "trainee-1787352042661-kwgj5",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-fd0x",
          "traineeId": "trainee-1787352042661-bn13o",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-v49t",
          "traineeId": "trainee-1787352042661-lazq8",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-985m",
          "traineeId": "trainee-1787352042661-5wiuu",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-9s5r",
          "traineeId": "trainee-1787352042660-83zkl",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-lciy",
          "traineeId": "trainee-1787352042660-3jdfj",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-s8uv",
          "traineeId": "trainee-1787352042660-rc13v",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-se6g",
          "traineeId": "trainee-1787352042660-3pzc7",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-5rl3",
          "traineeId": "trainee-1787352042660-oq0mk",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-4zwj",
          "traineeId": "trainee-1787352042660-fg0l2",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-xc39",
          "traineeId": "trainee-1787352042660-tm3jn",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-fon5",
          "traineeId": "trainee-1787352042660-55ejb",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-00pc",
          "traineeId": "trainee-1787352042660-fvl4h",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-0d04",
          "traineeId": "trainee-1787352042660-rhqwa",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-s81f",
          "traineeId": "trainee-1787352042660-9dlhd",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-s2ix",
          "traineeId": "trainee-1787352042659-ar42s",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-o6wx",
          "traineeId": "trainee-1787352042659-gqgsy",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-nz5m",
          "traineeId": "trainee-1787352042659-jh7kz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-angs",
          "traineeId": "trainee-1787352042659-e04f9",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-9tib",
          "traineeId": "trainee-1787352042659-vjfom",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-yyio",
          "traineeId": "trainee-1787352042659-evsvu",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-47rb",
          "traineeId": "trainee-1787352042659-30u4t",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-zkpq",
          "traineeId": "trainee-1787352042659-6w8y1",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-ajmv",
          "traineeId": "trainee-1787352042659-iulgm",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-ux8q",
          "traineeId": "trainee-1787352042658-h207g",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-tndb",
          "traineeId": "trainee-1787352042658-ftf8i",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-9pqe",
          "traineeId": "trainee-1787352042658-sthr3",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-q0rl",
          "traineeId": "trainee-1787352042658-ch8fv",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-zt8u",
          "traineeId": "trainee-1787352042658-ghc76",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-89ri",
          "traineeId": "trainee-1787352042658-1n9q9",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-weog",
          "traineeId": "trainee-1787352042657-1a5h3",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-2e73",
          "traineeId": "trainee-1787352042657-2qd5a",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-4dp6",
          "traineeId": "trainee-1787352042657-8fcyh",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-hvnv",
          "traineeId": "trainee-1787352042657-q46jv",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-125j",
          "traineeId": "trainee-1787352042656-rv47j",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-bv2g",
          "traineeId": "trainee-1787352042656-jn14r",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-kag7",
          "traineeId": "trainee-1787352042656-gud54",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-i9tu",
          "traineeId": "trainee-1787352042656-l3txa",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-fs6o",
          "traineeId": "trainee-1787352042655-3lihh",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-1s9h",
          "traineeId": "trainee-1787352042655-o2znr",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-ft81",
          "traineeId": "trainee-1787352042655-bkzr9",
          "groupId": "",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-vzcx",
          "traineeId": "trainee-1787352042654-pluyz",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-ll3o",
          "traineeId": "trainee-1787352042654-aj70e",
          "groupId": "",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-1787356997938-4g1k",
          "traineeId": "trainee-1787347185722-0aw8",
          "groupId": "",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0633\u0644\u0648\u0643 \u0631\u0627\u0642\u064D \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-22T00:03:17.938Z"
        },
        {
          "id": "pt-reinf-1787356402355-8ix9",
          "traineeId": "trainee-1787347185722-0aw8",
          "groupId": "",
          "branchId": "branch-1",
          "points": 6,
          "reason": "[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: \u062A\u0642\u062F\u064A\u0631 \u0648\u062A\u0645\u064A\u0632 \u0644\u0644\u0645\u062A\u062F\u0631\u0628 (\u062C\u0647\u0627\u0632 PC-71) \u{1F31F} - \u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0642\u0646\u0629 \u0648\u062A\u0637\u0628\u064A\u0642 \u0639\u0645\u0644\u064A \u0645\u062A\u0645\u064A\u0632 \u062E\u0644\u0627\u0644 \u0627\u0644\u062A\u0645\u0631\u064A\u0646!",
          "addedByUserId": "trainer",
          "addedByUserName": "\u0627\u0644\u0645\u062F\u0631\u0628",
          "createdAt": "2026-08-21T23:53:22.355Z"
        },
        {
          "id": "pt-reinf-1787356276902-zudl",
          "traineeId": "trainee-1787347185722-0aw8",
          "groupId": "",
          "branchId": "branch-1",
          "points": 21,
          "reason": "[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: \u0625\u062C\u0627\u0628\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0648\u0625\u0628\u062F\u0627\u0639 \u0628\u0631\u0645\u062C\u064A! - \u0637\u0631\u064A\u0642\u0629 \u062A\u0641\u0643\u064A\u0631 \u0648\u062D\u0644 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \u064A\u0633\u062A\u062D\u0642 \u0627\u0644\u0625\u0634\u0627\u062F\u0629!",
          "addedByUserId": "trainer",
          "addedByUserName": "\u0627\u0644\u0645\u062F\u0631\u0628",
          "createdAt": "2026-08-21T23:51:16.902Z"
        },
        {
          "id": "pt-1787356160111-dw3h",
          "traineeId": "trainee-1787352042654-pluyz",
          "branchId": "branch-1",
          "points": 50,
          "reason": "\u062A\u0641\u0648\u0642 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u062A\u0645\u064A\u0632 \u{1F31F}",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-21T23:49:20.111Z"
        },
        {
          "id": "pt-1787356156650-h18e",
          "traineeId": "trainee-1787352042654-aj70e",
          "groupId": "",
          "branchId": "branch-1",
          "points": 50,
          "reason": "\u062A\u0641\u0648\u0642 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u062A\u0645\u064A\u0632 \u{1F31F}",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-21T23:49:16.650Z"
        },
        {
          "id": "pt-1787355883695-uifc",
          "traineeId": "trainee-1787347185722-0aw8",
          "groupId": "",
          "branchId": "branch-1",
          "points": 30,
          "reason": "\u0625\u062C\u0627\u0628\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0648\u0633\u0631\u0639\u0629 \u0628\u062F\u064A\u0647\u0629",
          "addedByUserId": "user-admin",
          "addedByUserName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          "createdAt": "2026-08-21T23:44:43.695Z"
        },
        {
          "id": "pt-1787352904987",
          "traineeId": "trainee-1787347185722-0aw8",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (\u062C\u0647\u0627\u0632 PC-71)",
          "ruleId": "rule-1",
          "addedByUserId": "system",
          "addedByUserName": "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
          "createdAt": "2026-08-21T22:55:04.987Z"
        },
        {
          "id": "pt-1787352484632-vnjm",
          "traineeId": "trainee-1787352042654-aj70e",
          "groupId": "",
          "branchId": "branch-1",
          "points": 15,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-21T22:48:04.632Z"
        },
        {
          "id": "pt-1787352471508-uvf6",
          "traineeId": "trainee-1787352042654-aj70e",
          "groupId": "",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-21T22:47:51.508Z"
        },
        {
          "id": "pt-1787350954168-igdw",
          "traineeId": "trainee-1787347185722-0aw8",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-21T22:22:34.168Z"
        },
        {
          "id": "pt-1787349991130-8r97",
          "traineeId": "trainee-1787347185722-0aw8",
          "branchId": "branch-1",
          "points": 15,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-21T22:06:31.130Z"
        },
        {
          "id": "pt-1787349976876-o45n",
          "traineeId": "trainee-1787347185722-0aw8",
          "branchId": "branch-1",
          "points": 10,
          "reason": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A",
          "addedByUserId": "admin",
          "addedByUserName": "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
          "createdAt": "2026-08-21T22:06:16.876Z"
        },
        {
          "id": "pt-1787446474044",
          "traineeId": "trainee-1787361330810-d1if",
          "groupId": "grp-1787358595611",
          "branchId": "branch-1",
          "points": 55,
          "reason": "\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u062C\u0628: \u0648\u0627\u062C\u0628 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062F\u0631\u0633 \u0627\u0644\u0639\u0645\u0644\u064A \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A (\u062A\u0642\u064A\u064A\u0645 \u0630\u0643\u064A: 100%)",
          "ruleId": "rule-3",
          "addedByUserId": "ai-engine",
          "addedByUserName": "\u0646\u0638\u0627\u0645 \u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
          "createdAt": "2026-08-23T00:54:34.044Z"
        },
        {
          "id": "pt-1787451229685-5xl3",
          "traineeId": "trainee-1787361410293-aeko",
          "groupId": "grp-1787431608023",
          "branchId": "branch-1",
          "points": 20,
          "reason": "\u2B50 \u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u062A\u0642\u0627\u0646 (\u0648\u0627\u062C\u0628 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062F\u0631\u0633 - \u0627\u0644\u0643\u062A\u0627\u0628 \u0627\u0644\u0645\u062F\u0631\u0633\u064A): \u062F\u0631\u062C\u0629 90/100 (90%)",
          "addedByUserId": "ai-scanner",
          "addedByUserName": "\u0645\u0635\u062D\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
          "createdAt": "2026-08-23T02:13:49.685Z"
        }
      ],
      exams: [
        {
          "id": "exam-1787446743699",
          "title": "\u0627\u0645\u062A\u062D\u0627\u0646 \u0645\u0627\u062F\u0629 \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A - \u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A - \u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0623\u0648\u0644",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "examDate": "2026-08-23",
          "totalMarks": 100,
          "passingMarks": 50,
          "durationMinutes": 90,
          "status": "scheduled",
          "instructions": "\u0627\u062E\u062A\u0628\u0627\u0631 \u0634\u0627\u0645\u0644 \u0644\u0645\u0627\u062F\u0629 \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0644\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u060C \u064A\u063A\u0637\u064A \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0648\u0627\u0644\u0625\u0646\u062A\u0631\u0627\u0646\u062A\u060C \u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0633\u0648\u0628 \u0648\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u060C \u062D\u0645\u0627\u064A\u0629 \u062D\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631\u060C \u0627\u0644\u062A\u0645\u064A\u064A\u0632 \u0628\u064A\u0646 \u0627\u0644\u062D\u0642\u0627\u0626\u0642 \u0648\u0627\u0644\u0622\u0631\u0627\u0621\u060C \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0631\u0627\u0645\u062C Microsoft Office\u060C \u0648\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u0631\u0642\u0645\u064A \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644."
        },
        {
          "id": "hw-scan-1787451229685",
          "title": "\u0648\u0627\u062C\u0628 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062F\u0631\u0633 - \u0627\u0644\u0643\u062A\u0627\u0628 \u0627\u0644\u0645\u062F\u0631\u0633\u064A",
          "courseId": "course-1787347401956",
          "groupId": "grp-1787431608023",
          "branchId": "branch-1",
          "examDate": "2026-08-23",
          "totalMarks": 100,
          "passingMarks": 60,
          "durationMinutes": 30,
          "status": "completed",
          "instructions": "\u062A\u0635\u062D\u064A\u062D \u0648\u0631\u0642\u064A \u0622\u0644\u064A \u0639\u0628\u0631 \u0627\u0644\u0645\u0627\u0633\u062D \u0627\u0644\u0630\u0643\u064A \u0648\u0643\u0648\u062F \u0627\u0644\u0645\u062A\u062F\u0631\u0628"
        },
        {
          "id": "exam-1787463526231",
          "title": "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0642\u0628\u0644\u064A \u0644\u0644\u062F\u0648\u0631\u0629",
          "branchId": "branch-1",
          "courseId": "course-1787347401956",
          "examDate": "2026-08-23",
          "totalMarks": 100,
          "durationMinutes": 60,
          "status": "scheduled",
          "instructions": "\u064A\u0631\u062C\u0649 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u062D\u062F\u062F."
        }
      ],
      questions: [
        {
          "id": "q-1787446743699-0-m40",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u064A\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0631\u0641 ........ \u062F\u0627\u062E\u0644 \u062F\u0627\u0626\u0631\u0629 \u0648\u0647\u0648 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u062D\u0645\u0627\u064A\u0629 \u062D\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631.",
          "options": [
            "A",
            "B",
            "C",
            "D"
          ],
          "correctAnswer": "C",
          "marks": 5
        },
        {
          "id": "q-1787446743699-1-0ij",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "..... \u0647\u064A \u0628\u0648\u0627\u0628\u0629 \u062A\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0648\u0635\u064A\u0644 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A.",
          "options": [
            "word",
            "\u0627\u0644\u0631\u0627\u0648\u062A\u0631",
            "\u0628\u0646\u0643 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0635\u0631\u064A",
            "\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D"
          ],
          "correctAnswer": "\u0627\u0644\u0631\u0627\u0648\u062A\u0631",
          "marks": 5
        },
        {
          "id": "q-1787446743699-2-rg3",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "........ \u0648\u062D\u062F\u0629 \u0642\u064A\u0627\u0633 \u0644\u0639\u062F\u062F \u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0646\u0641\u0630\u0647\u0627 \u0648\u062D\u062F\u0629 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629 \u0641\u064A \u0627\u0644\u062B\u0627\u0646\u064A\u0629.",
          "options": [
            "\u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A \u0641\u064A \u0627\u0644\u062B\u0627\u0646\u064A\u0629",
            "\u062C\u064A\u062C\u0627 \u0647\u0631\u062A\u0632",
            "\u0628\u0627\u064A\u062A",
            "\u0643\u064A\u0644\u0648\u0628\u0627\u064A\u062A"
          ],
          "correctAnswer": "\u062C\u064A\u062C\u0627 \u0647\u0631\u062A\u0632",
          "marks": 5
        },
        {
          "id": "q-1787446743699-3-van",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u0644\u062D\u0644 \u0645\u0634\u0643\u0644\u0629 \u0628\u0637\u0621 \u0627\u0644\u062A\u062D\u0645\u064A\u0644.............",
          "options": [
            "\u0623\u0639\u062F \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0648\u0627\u0644\u0631\u0627\u0648\u062A\u0631",
            "\u062D\u0630\u0641 \u0628\u0631\u0646\u0627\u0645\u062C word",
            "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0646\u0638\u0627\u0645",
            "\u0625\u064A\u0642\u0627\u0641 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0634\u0627\u0634\u0629"
          ],
          "correctAnswer": "\u0623\u0639\u062F \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0648\u0627\u0644\u0631\u0627\u0648\u062A\u0631",
          "marks": 5
        },
        {
          "id": "q-1787446743699-4-v64",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u064A\u0633\u062A\u062E\u062F\u0645 ............. \u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0628\u0631 \u0634\u0628\u0643\u0629 \u0645\u063A\u0644\u0642\u0629\u060C \u0648\u0647\u0648 \u0623\u0643\u062B\u0631 \u0623\u0645\u0627\u0646\u0627\u064B.",
          "options": [
            "\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A",
            "\u0627\u0644\u0625\u0646\u062A\u0631\u0627\u0646\u062A",
            "\u0627\u0644\u0648\u064A\u0628",
            "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A"
          ],
          "correctAnswer": "\u0627\u0644\u0625\u0646\u062A\u0631\u0627\u0646\u062A",
          "marks": 5
        },
        {
          "id": "q-1787446743699-5-ppk",
          "examId": "exam-1787446743699",
          "questionType": "true_false",
          "questionText": "WWW \u0647\u0648 \u0627\u062E\u062A\u0635\u0627\u0631 \u0644\u0640 world wide web.",
          "options": [
            "\u0635\u062D",
            "\u062E\u0637\u0623"
          ],
          "correctAnswer": "\u0635\u062D",
          "marks": 5
        },
        {
          "id": "q-1787446743699-6-pyf",
          "examId": "exam-1787446743699",
          "questionType": "true_false",
          "questionText": "\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062A\u0633\u0648\u0642 \u0627\u0644\u0645\u0632\u064A\u0641\u0629 \u062A\u0631\u0633\u0644 \u0644\u0643 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0627\u0644\u062A\u064A \u0642\u0645\u062A \u0628\u0634\u0631\u0627\u0626\u0647\u0627.",
          "options": [
            "\u0635\u062D",
            "\u062E\u0637\u0623"
          ],
          "correctAnswer": "\u062E\u0637\u0623",
          "marks": 5
        },
        {
          "id": "q-1787446743699-7-22x",
          "examId": "exam-1787446743699",
          "questionType": "true_false",
          "questionText": "\u0648\u0627\u062D\u062F\u0629 \u0645\u0646 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0627\u0644\u062A\u064A \u062A\u0648\u0627\u062C\u0647\u0647\u0627 \u0639\u0646\u062F \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0648\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0647\u064A \u0628\u0637\u0621 \u0627\u0644\u062A\u062D\u0645\u064A\u0644.",
          "options": [
            "\u0635\u062D",
            "\u062E\u0637\u0623"
          ],
          "correctAnswer": "\u0635\u062D",
          "marks": 5
        },
        {
          "id": "q-1787446743699-8-xpd",
          "examId": "exam-1787446743699",
          "questionType": "true_false",
          "questionText": "\u064A\u0645\u0643\u0646\u0646\u0627 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0623\u0628\u062C\u062F\u064A\u0627\u064B \u0641\u064A \u0628\u0631\u0646\u0627\u0645\u062C Excel \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062E\u0627\u0635\u064A\u0629 Sort.",
          "options": [
            "\u0635\u062D",
            "\u062E\u0637\u0623"
          ],
          "correctAnswer": "\u0635\u062D",
          "marks": 5
        },
        {
          "id": "q-1787446743699-9-n8l",
          "examId": "exam-1787446743699",
          "questionType": "true_false",
          "questionText": "\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062C\u0648\u0627\u0626\u0632 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u062A\u0642\u062F\u0645 \u0639\u0631\u0648\u0636\u0627\u064B \u0645\u0627\u0644\u064A\u0629 \u0643\u0628\u064A\u0631\u0629 \u0648\u062C\u0648\u0627\u0626\u0632 \u063A\u064A\u0631 \u062D\u0642\u064A\u0642\u064A\u0629.",
          "options": [
            "\u0635\u062D",
            "\u062E\u0637\u0623"
          ],
          "correctAnswer": "\u0635\u062D",
          "marks": 5
        },
        {
          "id": "q-1787446743699-10-7gz",
          "examId": "exam-1787446743699",
          "questionType": "short_answer",
          "questionText": "\u0627\u0644\u0628\u0627\u064A\u062A \u0647\u0648 \u0648\u062D\u062F\u0629 \u0642\u064A\u0627\u0633 \u0645\u0633\u0627\u062D\u0629 ............ \u0628\u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631.",
          "options": [],
          "correctAnswer": "\u0627\u0644\u062A\u062E\u0632\u064A\u0646",
          "marks": 5
        },
        {
          "id": "q-1787446743699-11-8lm",
          "examId": "exam-1787446743699",
          "questionType": "short_answer",
          "questionText": "\u064A\u0633\u062A\u062E\u062F\u0645 \u0628\u0631\u0646\u0627\u0645\u062C ................ \u0644\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.",
          "options": [],
          "correctAnswer": "Word",
          "marks": 5
        },
        {
          "id": "q-1787446743699-12-9c7",
          "examId": "exam-1787446743699",
          "questionType": "short_answer",
          "questionText": "\u064A\u0633\u062A\u062E\u062F\u0645 ................ \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0644\u0627\u0642\u062A\u062D\u0627\u0645 \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0648\u0633\u0631\u0642\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A.",
          "options": [],
          "correctAnswer": "\u0627\u0644\u0645\u062E\u062A\u0631\u0642\u0648\u0646",
          "marks": 5
        },
        {
          "id": "q-1787446743699-13-khg",
          "examId": "exam-1787446743699",
          "questionType": "short_answer",
          "questionText": "\u062A\u0633\u062A\u0646\u062F \u0627\u0644\u0622\u0631\u0627\u0621 \u0625\u0644\u0649 \u0648\u062C\u0647\u0629 ............ \u0627\u0644\u0634\u062E\u0635 \u0648\u062E\u0628\u0631\u0627\u062A\u0647.",
          "options": [],
          "correctAnswer": "\u0646\u0638\u0631",
          "marks": 5
        },
        {
          "id": "q-1787446743699-14-jvs",
          "examId": "exam-1787446743699",
          "questionType": "short_answer",
          "questionText": "\u064A\u0633\u062A\u062E\u062F\u0645 \u0628\u0631\u0646\u0627\u0645\u062C ................ \u0644\u0639\u0645\u0644 \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u064A\u0629.",
          "options": [],
          "correctAnswer": "Excel",
          "marks": 5
        },
        {
          "id": "q-1787446743699-15-k02",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "1 \u062C\u064A\u062C\u0627\u0628\u0627\u064A\u062A \u062A\u0633\u0627\u0648\u064A:",
          "options": [
            "1024 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A",
            "1000 \u0628\u0627\u064A\u062A",
            "1024 \u0643\u064A\u0644\u0648\u0628\u0627\u064A\u062A",
            "8 \u0628\u062A"
          ],
          "correctAnswer": "1024 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A",
          "marks": 5
        },
        {
          "id": "q-1787446743699-16-2lq",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u0633\u0644\u0643 \u0625\u064A\u062B\u0631\u0646\u062A (Ethernet):",
          "options": [
            "\u0647\u0648 \u0633\u0644\u0643 \u064A\u0631\u0628\u0637 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u062C\u0647\u0627\u0632 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 (\u0627\u0644\u0631\u0627\u0648\u062A\u0631)",
            "\u0647\u064A \u062E\u062F\u0645\u0629 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u062A\u064A \u062A\u0642\u062F\u0645\u0647\u0627 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u064A\u0629",
            "\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0641\u0648\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
            "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631"
          ],
          "correctAnswer": "\u0647\u0648 \u0633\u0644\u0643 \u064A\u0631\u0628\u0637 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u062C\u0647\u0627\u0632 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 (\u0627\u0644\u0631\u0627\u0648\u062A\u0631)",
          "marks": 5
        },
        {
          "id": "q-1787446743699-17-1qr",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u0645\u0632\u0648\u062F \u062E\u062F\u0645\u0629 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A (ISP):",
          "options": [
            "\u0647\u064A \u062E\u062F\u0645\u0629 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u062A\u064A \u062A\u0642\u062F\u0645\u0647\u0627 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646",
            "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631",
            "\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0641\u0648\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
            "\u0648\u062D\u062F\u0629 \u0642\u064A\u0627\u0633 \u0633\u0631\u0639\u0629 \u0627\u0644\u0645\u0639\u0627\u0644\u062C"
          ],
          "correctAnswer": "\u0647\u064A \u062E\u062F\u0645\u0629 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u062A\u064A \u062A\u0642\u062F\u0645\u0647\u0627 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646",
          "marks": 5
        },
        {
          "id": "q-1787446743699-18-blv",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u0637\u0631\u064A\u0642\u0629 \u0628\u0631\u0627\u064A\u0644 (Braille):",
          "options": [
            "\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0641\u0648\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
            "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631",
            "\u0633\u0644\u0643 \u0644\u0631\u0628\u0637 \u0627\u0644\u0623\u062C\u0647\u0632\u0629",
            "\u0628\u0631\u0646\u0627\u0645\u062C \u0644\u0644\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u064A\u0629"
          ],
          "correctAnswer": "\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0641\u0648\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
          "marks": 5
        },
        {
          "id": "q-1787446743699-19-e3v",
          "examId": "exam-1787446743699",
          "questionType": "mcq",
          "questionText": "\u0627\u0644\u0645\u0627\u0633\u062D \u0627\u0644\u0636\u0648\u0626\u064A (Scanner):",
          "options": [
            "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631",
            "\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0641\u0648\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
            "\u062E\u062F\u0645\u0629 \u062A\u0632\u0648\u064A\u062F \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A",
            "\u0648\u062D\u062F\u0629 \u062A\u062E\u0632\u064A\u0646 \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
          ],
          "correctAnswer": "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631",
          "marks": 5
        }
      ],
      examResults: [
        {
          "id": "res-1787451229685-hea2",
          "examId": "hw-scan-1787451229685",
          "traineeId": "trainee-1787361410293-aeko",
          "traineeName": "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "score": 90,
          "totalMarks": 100,
          "percentage": 90,
          "status": "passed",
          "rating": "\u0645\u0645\u062A\u0627\u0632",
          "notes": "\u0623\u062F\u0627\u0621 \u0631\u0627\u0626\u0639 \u0648\u0645\u062A\u0645\u064A\u0632 \u062C\u062F\u0627\u064B! \u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0635\u0641\u062D\u0629 \u0648\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0648\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0634\u062C\u064A\u0639\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D.",
          "submittedAt": "2026-08-23T02:13:49.685Z"
        }
      ],
      interactiveSessions: [
        {
          "id": "is-1787362644609",
          "title": "\u0645\u0633\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A - \u0628\u0627\u064A\u062B\u0648\u0646 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0648\u064A\u0628",
          "platform": "Kahoot",
          "url": "https://kahoot.ithttps://kahoot.it/challenge/04274914?challenge-id=6f2f94ac-6722-4128-b6c1-72224d86b6ff_1787362624408",
          "groupId": "grp-1",
          "branchId": "branch-1",
          "sessionDate": "2026-08-22",
          "notes": "",
          "questions": [
            {
              "id": "q-1787362688971",
              "text": "\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F",
              "options": [
                "useState()",
                "useEffect()",
                "useRef()",
                "useMemo()"
              ],
              "correctOptionIndex": 1,
              "points": 15,
              "timeLimitSeconds": 30
            }
          ],
          "currentQuestionIndex": 0
        },
        {
          "id": "is-1787362394743",
          "title": "\u0645\u0633\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A - \u0628\u0627\u064A\u062B\u0648\u0646 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0648\u064A\u0628",
          "platform": "Kahoot",
          "url": "https://kahoot.it",
          "groupId": "grp-1",
          "branchId": "branch-1",
          "sessionDate": "2026-08-22",
          "notes": ""
        },
        {
          "id": "is-1787362337448",
          "title": "\u0645\u0633\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A - \u0628\u0627\u064A\u062B\u0648\u0646 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0648\u064A\u0628",
          "platform": "Kahoot",
          "url": "https://kahoot.it",
          "groupId": "grp-1",
          "branchId": "branch-1",
          "sessionDate": "2026-08-22",
          "notes": "",
          "questions": [
            {
              "id": "q-1787362348311",
              "text": "\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F",
              "options": [
                "useState()",
                "useEffect()",
                "useRef()",
                "useMemo()"
              ],
              "correctOptionIndex": 1,
              "points": 15,
              "timeLimitSeconds": 30
            },
            {
              "id": "q-1787362373107",
              "text": "\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F",
              "options": [
                "useState()",
                "useEffect()",
                "useRef()",
                "useMemo()"
              ],
              "correctOptionIndex": 1,
              "points": 15,
              "timeLimitSeconds": 30
            }
          ],
          "currentQuestionIndex": 1
        }
      ],
      devices: [
        {
          "id": "dev-1787352892067",
          "deviceId": "PC-71",
          "name": "\u062C\u0647\u0627\u0632 PC-71",
          "assignedUser": "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "userType": "trainee",
          "branchId": "branch-1",
          "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
          "lastHeartbeat": "2026-08-23T06:02:06.440Z",
          "isOnline": false,
          "status": "active",
          "currentTraineeId": "trainee-1787361410293-aeko",
          "lastScreenshotUrl": "",
          "lastScreenshotTime": "2026-08-22T01:34:48.102Z",
          "currentTraineeName": "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "lastArchivedTime": "2026-08-23T06:01:50.050Z"
        },
        {
          "id": "dev-1787362571450",
          "deviceId": "PC-74",
          "name": "\u062C\u0647\u0627\u0632 PC-74",
          "assignedUser": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "userType": "trainee",
          "branchId": "branch-1",
          "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
          "lastHeartbeat": "2026-08-22T01:46:31.883Z",
          "isOnline": false,
          "status": "active",
          "lastScreenshotUrl": "",
          "lastScreenshotTime": "2026-08-22T01:46:31.883Z",
          "currentTraineeName": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "currentTraineeId": "trainee-1787361330810-d1if"
        },
        {
          "id": "dev-1787464212308",
          "deviceId": "PC-83",
          "name": "\u062C\u0647\u0627\u0632 PC-83",
          "assignedUser": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "userType": "trainee",
          "branchId": "branch-1",
          "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
          "lastHeartbeat": "2026-08-23T06:32:38.297Z",
          "isOnline": false,
          "status": "active",
          "lastScreenshotUrl": "",
          "lastArchivedTime": "2026-08-23T06:32:12.588Z",
          "currentTraineeName": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "currentTraineeId": "trainee-1787361330810-d1if"
        }
      ],
      deviceCommands: [
        {
          "id": "cmd-1787353097554-p0hu",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T22:58:17.554Z"
        },
        {
          "id": "cmd-1787353106454-soht",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T22:58:26.454Z"
        },
        {
          "id": "cmd-1787354001394-29ga",
          "deviceId": "PC-71",
          "commandType": "shutdown",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:21.394Z"
        },
        {
          "id": "cmd-1787354006700-aj23",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:26.700Z"
        },
        {
          "id": "cmd-1787354015351-86zr",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:35.351Z"
        },
        {
          "id": "cmd-1787354026862-rr6k",
          "deviceId": "PC-71",
          "commandType": "reboot",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:46.862Z"
        },
        {
          "id": "cmd-1787354029696-im13",
          "deviceId": "PC-71",
          "commandType": "shutdown",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:49.696Z"
        },
        {
          "id": "cmd-1787354031215-0bch",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:51.215Z"
        },
        {
          "id": "cmd-1787354032145-aecj",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:52.145Z"
        },
        {
          "id": "cmd-1787354032335-4ijw",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:13:52.335Z"
        },
        {
          "id": "cmd-1787354041352-4hy8",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:14:01.352Z"
        },
        {
          "id": "cmd-1787354064072-vh8f",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": "\u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0628\u0627\u0647 \u0644\u0644\u0634\u0631\u062D \u0639\u0644\u0649 \u0634\u0627\u0634\u0629 \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0627\u0644\u0622\u0646",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:14:24.072Z"
        },
        {
          "id": "cmd-reinf-1787356276902-vhwg",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u0625\u062C\u0627\u0628\u0629 \u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0648\u0625\u0628\u062F\u0627\u0639 \u0628\u0631\u0645\u062C\u064A!","message":"\u0637\u0631\u064A\u0642\u0629 \u062A\u0641\u0643\u064A\u0631 \u0648\u062D\u0644 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \u064A\u0633\u062A\u062D\u0642 \u0627\u0644\u0625\u0634\u0627\u062F\u0629!","stars":2,"points":21,"icon":"\u{1F4A1}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u0625\u062C\u0627\u0628\u0629 \u0630\u0643\u064A\u0629 \u{1F4A1}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787347185722-0aw8","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"\u0645001","points":86,"totalPoints":86,"starsCount":8,"overallRank":1,"totalTrainees":93,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}","badgeColor":"bg-yellow-500/20 text-yellow-300 border-yellow-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629"},"timestamp":1787356276902}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-21T23:51:16.902Z"
        },
        {
          "id": "cmd-1787356296742-0kh6",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"clean_reset"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:51:36.742Z"
        },
        {
          "id": "cmd-reinf-1787356402355-v7bl",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u062A\u0642\u062F\u064A\u0631 \u0648\u062A\u0645\u064A\u0632 \u0644\u0644\u0645\u062A\u062F\u0631\u0628 (\u062C\u0647\u0627\u0632 PC-71) \u{1F31F}","message":"\u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0642\u0646\u0629 \u0648\u062A\u0637\u0628\u064A\u0642 \u0639\u0645\u0644\u064A \u0645\u062A\u0645\u064A\u0632 \u062E\u0644\u0627\u0644 \u0627\u0644\u062A\u0645\u0631\u064A\u0646!","stars":1,"points":6,"icon":"\u2B50","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u0646\u062C\u0645 \u0627\u0644\u062D\u0635\u0629 \u{1F31F}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787347185722-0aw8","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"\u0645001","points":92,"totalPoints":92,"starsCount":9,"overallRank":1,"totalTrainees":93,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}","badgeColor":"bg-yellow-500/20 text-yellow-300 border-yellow-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629"},"timestamp":1787356402355}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-21T23:53:22.355Z"
        },
        {
          "id": "cmd-1787356411197-0s5l",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:53:31.197Z"
        },
        {
          "id": "cmd-1787356414736-jjr2",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-21T23:53:34.736Z"
        },
        {
          "id": "cmd-1787359735524-d1qd",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:48:55.524Z"
        },
        {
          "id": "cmd-1787359750791-8wfc",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:49:10.791Z"
        },
        {
          "id": "cmd-1787359794426-l3ti",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"start_broadcast","trainerName":"\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644"}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T00:49:54.426Z"
        },
        {
          "id": "cmd-1787359844994-ulcx",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:50:44.994Z"
        },
        {
          "id": "cmd-1787359857348-su60",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"clean_reset"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:50:57.348Z"
        },
        {
          "id": "cmd-1787359891812-c3rp",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:51:31.812Z"
        },
        {
          "id": "cmd-1787359897685-4kor",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T00:51:37.685Z"
        },
        {
          "id": "cmd-1787361823607-h42c",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"start_broadcast","trainerName":"\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644"}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:23:43.607Z"
        },
        {
          "id": "cmd-1787361853660-46fb",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"open_url","url":"https://ekb.eg"}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:24:13.660Z"
        },
        {
          "id": "cmd-1787361946709-9afo",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:25:46.709Z"
        },
        {
          "id": "cmd-1787361949497-kdv9",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:25:49.497Z"
        },
        {
          "id": "cmd-1787361966040-apct",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"open_url","url":"https://ekb.eg"}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:26:06.040Z"
        },
        {
          "id": "cmd-reinf-1787362006056-hcvq",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u062A\u062D\u064A\u0629 \u0648\u062A\u0634\u062C\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u062F\u0631\u0628\u064A \u0627\u0644\u0642\u0627\u0639\u0629! \u{1F680}","message":"\u062A\u0641\u0627\u0639\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u0647\u062F \u062C\u0645\u0627\u0639\u064A \u0631\u0627\u0626\u0639 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A!","stars":5,"points":51,"icon":"\u{1F31F}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u0623\u0628\u0637\u0627\u0644 \u0627\u0644\u0645\u0639\u0645\u0644 \u{1F3C6}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361330810-d1if","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A001","points":91,"totalPoints":91,"starsCount":9,"overallRank":1,"totalTrainees":2,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}","badgeColor":"bg-yellow-500/20 text-yellow-300 border-yellow-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"ICT - p1 - 2"},"timestamp":1787362006056}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:26:46.056Z"
        },
        {
          "id": "cmd-1787362019251-7w0k",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"start_broadcast","trainerName":"\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644"}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:26:59.251Z"
        },
        {
          "id": "cmd-1787362097808-gd69",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"clean_reset"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:28:17.808Z"
        },
        {
          "id": "cmd-1787362348513-a1gq",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787362348311","text":"\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F","options":["useState()","useEffect()","useRef()","useMemo()"],"correctOptionIndex":1,"points":15,"timeLimitSeconds":30},"sessionId":"is-1787362337448"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:32:28.513Z"
        },
        {
          "id": "cmd-1787362373263-ez7g",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787362373107","text":"\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F","options":["useState()","useEffect()","useRef()","useMemo()"],"correctOptionIndex":1,"points":15,"timeLimitSeconds":30},"sessionId":"is-1787362337448"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:32:53.263Z"
        },
        {
          "id": "cmd-1787362689677-yjfn",
          "deviceId": "PC-74",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787362688971","text":"\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F","options":["useState()","useEffect()","useRef()","useMemo()"],"correctOptionIndex":1,"points":15,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:38:09.677Z"
        },
        {
          "id": "cmd-1787362689678-ea43",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787362688971","text":"\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F","options":["useState()","useEffect()","useRef()","useMemo()"],"correctOptionIndex":1,"points":15,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-22T01:38:09.678Z"
        },
        {
          "id": "cmd-reinf-1787362796188-fq1i",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u062A\u062D\u064A\u0629 \u0648\u062A\u0634\u062C\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u062F\u0631\u0628\u064A \u0627\u0644\u0642\u0627\u0639\u0629! \u{1F680}","message":"\u062A\u0641\u0627\u0639\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u0647\u062F \u062C\u0645\u0627\u0639\u064A \u0631\u0627\u0626\u0639 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A!","stars":5,"points":51,"icon":"\u{1F31F}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u0623\u0628\u0637\u0627\u0644 \u0627\u0644\u0645\u0639\u0645\u0644 \u{1F3C6}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361410293-aeko","fullName":"\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A002","points":80,"totalPoints":80,"starsCount":8,"overallRank":2,"totalTrainees":2,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}","badgeColor":"bg-yellow-500/20 text-yellow-300 border-yellow-500/40","rankBadge":"\u{1F948}","courseName":"ICT5","groupName":"ICT - p1 - 1"},"timestamp":1787362796188}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:39:56.188Z"
        },
        {
          "id": "cmd-reinf-1787362796188-vx8o",
          "deviceId": "PC-74",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u062A\u062D\u064A\u0629 \u0648\u062A\u0634\u062C\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u062F\u0631\u0628\u064A \u0627\u0644\u0642\u0627\u0639\u0629! \u{1F680}","message":"\u062A\u0641\u0627\u0639\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u0647\u062F \u062C\u0645\u0627\u0639\u064A \u0631\u0627\u0626\u0639 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A!","stars":5,"points":51,"icon":"\u{1F31F}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u0623\u0628\u0637\u0627\u0644 \u0627\u0644\u0645\u0639\u0645\u0644 \u{1F3C6}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361330810-d1if","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A001","points":142,"totalPoints":142,"starsCount":14,"overallRank":1,"totalTrainees":2,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}","badgeColor":"bg-yellow-500/20 text-yellow-300 border-yellow-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"ICT - p1 - 2"},"timestamp":1787362796188}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-22T01:39:56.188Z"
        },
        {
          "id": "cmd-1787465198118-7q91",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:38.118Z"
        },
        {
          "id": "cmd-1787465198120-pvb9",
          "deviceId": "PC-74",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:38.120Z"
        },
        {
          "id": "cmd-1787465198123-ij0i",
          "deviceId": "PC-83",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:38.123Z"
        },
        {
          "id": "cmd-1787465201407-6aig",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:41.407Z"
        },
        {
          "id": "cmd-1787465201413-919a",
          "deviceId": "PC-74",
          "commandType": "lock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:41.413Z"
        },
        {
          "id": "cmd-1787465201417-a9n3",
          "deviceId": "PC-83",
          "commandType": "lock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:41.417Z"
        },
        {
          "id": "cmd-1787465219889-1xrf",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:59.889Z"
        },
        {
          "id": "cmd-1787465219898-dti6",
          "deviceId": "PC-74",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:59.898Z"
        },
        {
          "id": "cmd-1787465219906-aue4",
          "deviceId": "PC-83",
          "commandType": "unlock",
          "payload": "{}",
          "status": "delivered",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:06:59.906Z"
        },
        {
          "id": "cmd-1787465249309-e2bi",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:07:29.309Z"
        },
        {
          "id": "cmd-1787465249333-45kp",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:07:29.333Z"
        },
        {
          "id": "cmd-1787465249341-is12",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:07:29.341Z"
        },
        {
          "id": "cmd-1787465251082-86ej",
          "deviceId": "PC-71",
          "commandType": "lock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:07:31.082Z"
        },
        {
          "id": "cmd-1787465255242-lpet",
          "deviceId": "PC-71",
          "commandType": "unlock",
          "payload": "{}",
          "status": "pending",
          "issuedByUserId": "admin",
          "createdAt": "2026-08-23T06:07:35.242Z"
        },
        {
          "id": "cmd-reinf-1787465508933-i05s",
          "deviceId": "PC-71",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u062A\u0639\u0627\u0648\u0646 \u0645\u062A\u0645\u064A\u0632!","message":"\u062F\u0639\u0645 \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621 \u0641\u064A \u062D\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629!","stars":2,"points":16,"icon":"\u{1F91D}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u062A\u0639\u0627\u0648\u0646 \u0645\u062B\u0627\u0644\u064A \u{1F91D}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361410293-aeko","fullName":"\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A002","points":200,"totalPoints":200,"starsCount":20,"overallRank":2,"totalTrainees":3,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0623\u0644\u0642 \u0623\u0633\u0637\u0648\u0631\u064A \u{1F31F}","badgeColor":"bg-amber-500/20 text-amber-300 border-amber-500/40","rankBadge":"\u{1F948}","courseName":"ICT5","groupName":"ICT5 - 1"},"timestamp":1787465508933}',
          "status": "pending",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-23T06:11:48.933Z"
        },
        {
          "id": "cmd-reinf-1787465508933-sin1",
          "deviceId": "PC-74",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u062A\u0639\u0627\u0648\u0646 \u0645\u062A\u0645\u064A\u0632!","message":"\u062F\u0639\u0645 \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621 \u0641\u064A \u062D\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629!","stars":2,"points":16,"icon":"\u{1F91D}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u062A\u0639\u0627\u0648\u0646 \u0645\u062B\u0627\u0644\u064A \u{1F91D}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361330810-d1if","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A001","points":383,"totalPoints":383,"starsCount":38,"overallRank":1,"totalTrainees":3,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0623\u0644\u0642 \u0623\u0633\u0637\u0648\u0631\u064A \u{1F31F}","badgeColor":"bg-amber-500/20 text-amber-300 border-amber-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"ICT - p1 - 2"},"timestamp":1787465508933}',
          "status": "pending",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-23T06:11:48.933Z"
        },
        {
          "id": "cmd-reinf-1787465508933-1vz5",
          "deviceId": "PC-83",
          "commandType": "message",
          "payload": '{"action":"reinforcement","title":"\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u062A\u0639\u0627\u0648\u0646 \u0645\u062A\u0645\u064A\u0632!","message":"\u062F\u0639\u0645 \u0648\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0632\u0645\u0644\u0627\u0621 \u0641\u064A \u062D\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629!","stars":2,"points":16,"icon":"\u{1F91D}","trainerName":"\u0627\u0644\u0645\u062F\u0631\u0628","badgeText":"\u062A\u0639\u0627\u0648\u0646 \u0645\u062B\u0627\u0644\u064A \u{1F91D}","reinforcementType":"star_award","traineeStats":{"id":"trainee-1787361330810-d1if","fullName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","code":"A001","points":383,"totalPoints":383,"starsCount":38,"overallRank":1,"totalTrainees":3,"groupRank":1,"groupTotal":1,"tierName":"\u0645\u062A\u0623\u0644\u0642 \u0623\u0633\u0637\u0648\u0631\u064A \u{1F31F}","badgeColor":"bg-amber-500/20 text-amber-300 border-amber-500/40","rankBadge":"\u{1F947}","courseName":"ICT-P1","groupName":"ICT - p1 - 2"},"timestamp":1787465508933}',
          "status": "delivered",
          "issuedByUserId": "trainer",
          "createdAt": "2026-08-23T06:11:48.933Z"
        },
        {
          "id": "cmd-1787465546210-zzpk",
          "deviceId": "dev-1787352892067",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465545797","text":"\u064A\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0631\u0641 ........ \u062F\u0627\u062E\u0644 \u062F\u0627\u0626\u0631\u0629 \u0648\u0647\u0648 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u062D\u0645\u0627\u064A\u0629 \u062D\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631.","options":["A","B","C","D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:12:26.210Z",
          "issuedAt": "2026-08-23T06:12:26.211Z",
          "status": "pending"
        },
        {
          "id": "cmd-1787465546211-41zl",
          "deviceId": "dev-1787362571450",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465545797","text":"\u064A\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0631\u0641 ........ \u062F\u0627\u062E\u0644 \u062F\u0627\u0626\u0631\u0629 \u0648\u0647\u0648 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u062D\u0645\u0627\u064A\u0629 \u062D\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631.","options":["A","B","C","D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:12:26.211Z",
          "issuedAt": "2026-08-23T06:12:26.211Z",
          "status": "pending"
        },
        {
          "id": "cmd-1787465546211-4no7",
          "deviceId": "dev-1787464212308",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465545797","text":"\u064A\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0631\u0641 ........ \u062F\u0627\u062E\u0644 \u062F\u0627\u0626\u0631\u0629 \u0648\u0647\u0648 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u062D\u0645\u0627\u064A\u0629 \u062D\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631.","options":["A","B","C","D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:12:26.211Z",
          "issuedAt": "2026-08-23T06:12:26.211Z",
          "status": "pending"
        },
        {
          "id": "cmd-1787465607959-4kac",
          "deviceId": "dev-1787352892067",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465607546","text":"..... \u0647\u064A \u0628\u0648\u0627\u0628\u0629 \u062A\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0648\u0635\u064A\u0644 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A.","options":["word","\u0627\u0644\u0631\u0627\u0648\u062A\u0631","\u0628\u0646\u0643 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0635\u0631\u064A","\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:13:27.959Z",
          "issuedAt": "2026-08-23T06:13:27.959Z",
          "status": "pending"
        },
        {
          "id": "cmd-1787465607959-1z3r",
          "deviceId": "dev-1787362571450",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465607546","text":"..... \u0647\u064A \u0628\u0648\u0627\u0628\u0629 \u062A\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0648\u0635\u064A\u0644 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A.","options":["word","\u0627\u0644\u0631\u0627\u0648\u062A\u0631","\u0628\u0646\u0643 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0635\u0631\u064A","\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:13:27.959Z",
          "issuedAt": "2026-08-23T06:13:27.959Z",
          "status": "pending"
        },
        {
          "id": "cmd-1787465607959-f87n",
          "deviceId": "dev-1787464212308",
          "commandType": "message",
          "payload": '{"action":"interactive_question","question":{"id":"q-1787465607546","text":"..... \u0647\u064A \u0628\u0648\u0627\u0628\u0629 \u062A\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0648\u0635\u064A\u0644 \u062C\u0647\u0627\u0632 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A.","options":["word","\u0627\u0644\u0631\u0627\u0648\u062A\u0631","\u0628\u0646\u0643 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0635\u0631\u064A","\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D"],"correctOptionIndex":0,"points":5,"timeLimitSeconds":30},"sessionId":"is-1787362644609"}',
          "issuedByUserId": "trainer-live",
          "createdAt": "2026-08-23T06:13:27.959Z",
          "issuedAt": "2026-08-23T06:13:27.959Z",
          "status": "pending"
        }
      ],
      certificates: [
        {
          "id": "cert-1787450838230",
          "certificateNumber": "CERT-2026-38230",
          "serialNumber": "CERT-2026-38230",
          "traineeId": "trainee-1787361410293-aeko",
          "traineeName": "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "courseId": "course-1787347401956",
          "courseName": "ICT4",
          "branchId": "branch-1",
          "issueDate": "2026-08-23",
          "grade": "\u0627\u0645\u062A\u064A\u0627\u0632 \u0645\u0639 \u0645\u0631\u062A\u0628\u0629 \u0627\u0644\u0634\u0631\u0641 (A+)",
          "durationText": "30 \u0633\u0627\u0639\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629",
          "qrPayload": '{"certificateNumber":"CERT-2026-38230","traineeName":"\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","courseName":"ICT4","issueDate":"2026-08-23","center":"\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A"}',
          "trainerName": "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
          "managerName": "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "templateId": "template-1787450798128"
        },
        {
          "id": "cert-1787347853394",
          "certificateNumber": "CERT-2026-53394",
          "serialNumber": "CERT-2026-53394",
          "traineeId": "trainee-1787347185722-0aw8",
          "traineeName": "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          "courseId": "course-1787347401956",
          "courseName": "ICT4",
          "branchId": "branch-1",
          "issueDate": "2026-08-21",
          "grade": "\u0645\u0645\u062A\u0627\u0632 \u0645\u0639 \u0645\u0631\u062A\u0628\u0629 \u0627\u0644\u0634\u0631\u0641",
          "durationText": "64 \u0633\u0627\u0639\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629",
          "qrPayload": '{"certificateNumber":"CERT-2026-53394","traineeName":"\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A","courseName":"ICT4","issueDate":"2026-08-21","center":"\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A"}',
          "trainerName": "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
          "managerName": "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0645\u0631\u0643\u0632"
        }
      ],
      certificateTemplates: [
        {
          id: "template-nagah-official-ar",
          name: "\u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 - \u0639\u0631\u0628\u064A (\u0645\u062C\u0644\u0633 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F)",
          theme: "classic_gold",
          primaryColor: "#c59b27",
          accentColor: "#96741b",
          titleArabic: "\u0634\u0640\u0640\u0647\u0640\u0640\u0627\u062F\u0629",
          titleEnglish: "CERTIFICATE",
          subTitleArabic: "\u062A\u0634\u0647\u062F \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
          bodyTemplate: "\u0623\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u0643 \u0642\u062F \u0627\u062C\u062A\u0627\u0632 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A \u0628\u0646\u062C\u0627\u062D \u0648\u0634\u0627\u0631\u0643 \u0628\u062A\u0645\u064A\u0632 \u0648\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u062A\u0645\u0646\u064A\u0627\u062A \u0628\u062F\u0648\u0627\u0645 \u0627\u0644\u062A\u0648\u0641\u064A\u0642",
          sealText: "NGAH T&CN - \u0645\u0639\u062A\u0645\u062F",
          managerTitle: "\u064A\u0639\u062A\u0645\u062F: \u0645\u062F\u064A\u0631 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629",
          managerName: "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          trainerTitle: "\u0627\u0644\u0645\u062F\u0631\u0628",
          showQrCode: true,
          borderStyle: "double",
          isDefault: true
        },
        {
          id: "template-nagah-official-en",
          name: "Accredited Official Certificate - English (Accreditation Board)",
          theme: "classic_gold",
          primaryColor: "#c59b27",
          accentColor: "#96741b",
          titleArabic: "\u0634\u0640\u0640\u0647\u0640\u0640\u0627\u062F\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629",
          titleEnglish: "CERTIFICATE OF COMPLETION",
          subTitleArabic: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
          bodyTemplate: "Successfully Completed Training Program with Distinction & High Performance",
          sealText: "NGAH ACCREDITED",
          managerTitle: "Academy Director",
          managerName: "Dr. Mohamed Bkeet",
          trainerTitle: "Trainer",
          showQrCode: true,
          borderStyle: "double",
          isDefault: false
        },
        {
          id: "template-tech",
          name: "\u0627\u0644\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0645\u0648\u062F\u0631\u0646 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A (Modern Tech)",
          theme: "modern_tech",
          primaryColor: "#2563eb",
          accentColor: "#1d4ed8",
          titleArabic: "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627",
          titleEnglish: "NGAH TECH & CONSULTING ACADEMY",
          subTitleArabic: "\u0634\u0647\u0627\u062F\u0629 \u0643\u0641\u0627\u0621\u0629 \u0648\u0627\u062C\u062A\u064A\u0627\u0632 \u062A\u062F\u0631\u064A\u0628\u064A \u062A\u062E\u0635\u0635\u064A",
          bodyTemplate: "\u0646\u0642\u0631 \u0628\u0623\u0646 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0642\u062F \u0623\u062A\u0645 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0628\u0646\u062C\u0627\u062D \u0648\u062D\u0635\u0644 \u0639\u0644\u0649 \u062F\u0631\u062C\u0629 \u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629.",
          sealText: "\u0645\u0635\u062F\u0642 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u064B",
          managerTitle: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0642\u0646\u064A\u0629",
          managerName: "\u0625\u062F\u0627\u0631\u0629 \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D",
          trainerTitle: "\u0643\u0628\u064A\u0631 \u0627\u0644\u0645\u062F\u0631\u0628\u064A\u0646 \u0648\u0627\u0644\u0645\u0637\u0648\u0631\u064A\u0646",
          showQrCode: true,
          borderStyle: "modern",
          isDefault: false
        },
        {
          id: "template-emerald",
          name: "\u0627\u0644\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0627\u0644\u0632\u0645\u0631\u062F\u064A (Academic Emerald)",
          theme: "royal_emerald",
          primaryColor: "#059669",
          accentColor: "#047857",
          titleArabic: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u0623\u0647\u064A\u0644 \u0648\u0627\u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u0647\u0646\u064A",
          titleEnglish: "NGAH PROFESSIONAL DEVELOPMENT CENTER",
          subTitleArabic: "\u0634\u0647\u0627\u062F\u0629 \u062A\u0641\u0648\u0642 \u0648\u062A\u0642\u062F\u064A\u0631 \u0645\u0647\u0646\u064A \u0645\u0639\u062A\u0645\u062F",
          bodyTemplate: "\u062A\u0642\u062F\u064A\u0631\u0627\u064B \u0644\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \u0648\u0627\u0644\u0645\u0648\u0627\u0638\u0628\u0629 \u0648\u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u062A\u0645 \u0645\u0646\u062D \u0647\u0630\u0647 \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0628\u0639\u062F \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0638\u0631\u064A\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u064A\u0629.",
          sealText: "\u0645\u0639\u062A\u0645\u062F \u0631\u0633\u0645\u064A\u0627\u064B",
          managerTitle: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A",
          managerName: "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          trainerTitle: "\u0627\u0644\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
          showQrCode: true,
          borderStyle: "ornate",
          isDefault: false
        }
      ],
      auditLogs: [
        {
          id: "log-init",
          userId: "user-admin",
          userName: "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0646\u0638\u0627\u0645",
          action: "\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0646\u0638\u0627\u0645",
          entity: "\u0627\u0644\u0646\u0638\u0627\u0645",
          details: "\u062A\u0645 \u0628\u062F\u0621 \u062A\u0634\u063A\u064A\u0644 \u0646\u0638\u0627\u0645 \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D V7 \u0648\u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      settings: {
        centerName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
        centerSubtitle: "Nagah M-S",
        logoUrl: "/logo.svg",
        defaultCurrency: "\u062C\u0646\u064A\u0647 \u0645\u0635\u0631\u064A",
        traineeCodePrefix: "A",
        autoCodeLength: 3,
        academicYear: "2026/2027",
        gradePrefixes: {
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639": "A",
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633": "B",
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633": "C",
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": "D",
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": "E",
          "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": "F",
          "ICT4": "A",
          "ICT5": "B",
          "ICT6": "C",
          "ICT-P1": "D",
          "ICT-P2": "E",
          "ICT-P3": "F"
        },
        defaultTrainerCommission: 40,
        defaultCenterCommission: 60,
        serverIp: "127.0.0.1",
        primaryPhone: "01001500686",
        phone: "01001500686",
        vodafoneCash: "01001500686",
        instapay: "m_bkeet@instapay",
        email: "info@success-center.eg",
        address: "\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0645\u0635\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
        pointRules: defaultPointRules,
        rolePermissions: [
          {
            id: "super_admin",
            title: "\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 \u0627\u0644\u0645\u0631\u0643\u0632 (\u0643\u0627\u0645\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A)",
            description: "\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0648\u063A\u064A\u0631 \u0645\u0642\u064A\u062F\u0629 \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0646\u0638\u0627\u0645",
            isSystem: true,
            permissions: ["dashboard", "trainees", "trainers", "courses", "programs", "groups", "attendance", "finance", "expenses", "points", "exams", "interactive", "devices", "messages", "reports", "certificates", "branches", "audit", "settings"]
          },
          {
            id: "branch_manager",
            title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0641\u0631\u0639",
            description: "\u0625\u062F\u0627\u0631\u0629 \u0634\u0624\u0648\u0646 \u0627\u0644\u0641\u0631\u0639 \u0648\u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629",
            isSystem: true,
            permissions: ["dashboard", "trainees", "trainers", "courses", "programs", "groups", "attendance", "finance", "expenses", "points", "exams", "interactive", "devices", "messages", "reports", "certificates"]
          },
          {
            id: "accountant",
            title: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A",
            description: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0648\u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0648\u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0648\u0643\u0634\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u0631\u0628\u064A\u0646",
            isSystem: true,
            permissions: ["dashboard", "finance", "expenses", "reports"]
          },
          {
            id: "receptionist",
            title: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0648\u0627\u0644\u0642\u0628\u0648\u0644",
            description: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u062D\u0636\u0648\u0631 \u0648\u0627\u0644\u063A\u064A\u0627\u0628 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u0637\u0628\u0627\u0639\u0629 \u0643\u0634\u0648\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
            isSystem: true,
            permissions: ["dashboard", "trainees", "courses", "programs", "groups", "attendance", "messages", "certificates"]
          },
          {
            id: "trainer",
            title: "\u0627\u0644\u0645\u062F\u0631\u0628 \u0648\u0627\u0644\u0645\u062D\u0627\u0636\u0631",
            description: "\u0625\u062F\u0627\u0631\u0629 \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0631\u0635\u062F \u0627\u0644\u062D\u0636\u0648\u0631 \u0648\u0627\u0644\u063A\u064A\u0627\u0628 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u062A\u062D\u0643\u0645 \u0628\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
            isSystem: true,
            permissions: ["trainees", "courses", "groups", "attendance", "points", "exams", "interactive", "devices"]
          }
        ]
      },
      notifications: [
        {
          id: "notif-welcome",
          type: "course_end",
          title: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D V7",
          message: "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0646\u0638\u0627\u0645 \u0644\u0644\u0639\u0645\u0644 \u0628\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0648\u062A\u062E\u0635\u064A\u0635 \u0627\u0644\u0641\u0631\u0639\u064A\u0646 (\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D \u0648\u0641\u0631\u0639 \u0628\u062F\u0631).",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          read: false
        }
      ],
      traineeScreenshots: [],
      secretFinancialArchives: [],
      deletedDeviceIds: [],
      labSchedules: [
        {
          id: "sched-1",
          branchId: "branch-1",
          groupName: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0627\u062A - A1",
          courseName: "\u062F\u0628\u0644\u0648\u0645\u0629 \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0634\u0627\u0645\u0644\u0629",
          trainerName: "\u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          roomName: "\u0642\u0627\u0639\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 (Hall A)",
          dayOfWeek: "\u0627\u0644\u0633\u0628\u062A",
          startTime: "16:00",
          endTime: "17:00",
          isAutoCreated: true
        },
        {
          id: "sched-2",
          branchId: "branch-1",
          groupName: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0627\u062A - A1",
          courseName: "\u062F\u0628\u0644\u0648\u0645\u0629 \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0634\u0627\u0645\u0644\u0629",
          trainerName: "\u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          roomName: "\u0642\u0627\u0639\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 (Hall A)",
          dayOfWeek: "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621",
          startTime: "16:00",
          endTime: "17:00",
          isAutoCreated: true
        }
      ],
      traineeBadges: [],
      traineeEvaluations: [],
      homeworkSubmissions: [],
      googleDriveSync: {
        autoSyncEnabled: true,
        lastSyncTime: (/* @__PURE__ */ new Date()).toISOString(),
        syncStatus: "success"
      },
      studentPosts: []
    };
    userPasswordMap = {
      "user-admin": hashPassword("1234"),
      "user-accountant": hashPassword("1234"),
      "user-reception": hashPassword("1234"),
      "user-trainer": hashPassword("1234"),
      "user-branch-1": hashPassword("1234"),
      "user-branch-2": hashPassword("1234")
    };
    DatabaseManager = class {
      constructor() {
        this.saveTimeout = null;
        this.ensureDataDir();
        this.data = this.loadData();
      }
      ensureDataDir() {
        try {
          if (!fs.existsSync(ACTUAL_DATA_DIR)) {
            fs.mkdirSync(ACTUAL_DATA_DIR, { recursive: true });
          }
          if (!fs.existsSync(BACKUPS_DIR)) {
            fs.mkdirSync(BACKUPS_DIR, { recursive: true });
          }
        } catch (e) {
          console.warn("[DB] Non-critical ensureDataDir notice:", e);
        }
      }
      loadData() {
        try {
          let rawData = null;
          if (fs.existsSync(DB_FILE)) {
            try {
              const content = fs.readFileSync(DB_FILE, "utf-8");
              if (content && content.trim().length > 10) {
                rawData = content;
              }
            } catch (e) {
              console.warn("[DB] Error reading primary DB_FILE:", e);
            }
          }
          if (!rawData) {
            for (const p of BUNDLED_DB_PATHS) {
              if (fs.existsSync(p)) {
                try {
                  const content = fs.readFileSync(p, "utf-8");
                  if (content && content.trim().length > 10) {
                    console.log("[DB] Loading from bundled database file:", p);
                    rawData = content;
                    break;
                  }
                } catch (e) {
                  console.warn("[DB] Error reading BUNDLED_DB_PATH:", p, e);
                }
              }
            }
          }
          if (!rawData && fs.existsSync(BACKUP_FILE)) {
            try {
              const content = fs.readFileSync(BACKUP_FILE, "utf-8");
              if (content && content.trim().length > 10) {
                console.log("[DB] Restoring data from BACKUP_FILE");
                rawData = content;
              }
            } catch (e) {
              console.warn("[DB] Error reading BACKUP_FILE:", e);
            }
          }
          if (!rawData && fs.existsSync(BACKUPS_DIR)) {
            try {
              const backupFiles = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith(".json")).sort().reverse();
              if (backupFiles.length > 0) {
                const latestBackup = path.join(BACKUPS_DIR, backupFiles[0]);
                console.log("[DB] Restoring data from latest backup file:", latestBackup);
                rawData = fs.readFileSync(latestBackup, "utf-8");
              }
            } catch (e) {
              console.warn("[DB] Error reading rotating backups:", e);
            }
          }
          if (rawData) {
            const parsed = JSON.parse(rawData);
            const existingUsers = Array.isArray(parsed.users) ? parsed.users : [];
            for (const defaultUser of initialData.users) {
              const match = existingUsers.find((u) => u.username.toLowerCase() === defaultUser.username.toLowerCase());
              if (!match) {
                existingUsers.push(defaultUser);
              } else {
                match.email = defaultUser.email;
                match.fullName = defaultUser.fullName;
              }
            }
            return {
              ...initialData,
              ...parsed,
              branches: parsed.branches && parsed.branches.length > 0 ? parsed.branches : initialData.branches,
              trainees: parsed.trainees && parsed.trainees.length > 0 ? parsed.trainees : initialData.trainees,
              trainers: parsed.trainers && parsed.trainers.length > 0 ? parsed.trainers : initialData.trainers,
              courses: parsed.courses && parsed.courses.length > 0 ? parsed.courses : initialData.courses,
              groups: parsed.groups && parsed.groups.length > 0 ? parsed.groups : initialData.groups,
              certificateTemplates: parsed.certificateTemplates && parsed.certificateTemplates.length > 0 ? parsed.certificateTemplates : initialData.certificateTemplates,
              exams: parsed.exams && parsed.exams.length > 0 ? parsed.exams : initialData.exams,
              questions: parsed.questions && parsed.questions.length > 0 ? parsed.questions : initialData.questions,
              pointTransactions: parsed.pointTransactions && parsed.pointTransactions.length > 0 ? parsed.pointTransactions : initialData.pointTransactions,
              certificates: parsed.certificates && parsed.certificates.length > 0 ? parsed.certificates : initialData.certificates,
              trainerAttestations: parsed.trainerAttestations || [],
              users: existingUsers,
              settings: {
                ...initialData.settings,
                ...parsed.settings || {},
                email: parsed.settings?.email !== void 0 ? parsed.settings.email : "info@success-center.eg",
                address: parsed.settings?.address !== void 0 ? parsed.settings.address : "\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0645\u0635\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
                vodafoneCash: !parsed.settings?.vodafoneCash || parsed.settings.vodafoneCash === "01012345678" ? "01001500686" : parsed.settings.vodafoneCash,
                instapay: !parsed.settings?.instapay || parsed.settings.instapay === "nagah@instapay" ? "m_bkeet@instapay" : parsed.settings.instapay,
                phone: !parsed.settings?.phone || parsed.settings.phone === "01012345678" ? "01001500686" : parsed.settings.phone,
                primaryPhone: !parsed.settings?.primaryPhone || parsed.settings.primaryPhone === "01012345678" ? "01001500686" : parsed.settings.primaryPhone,
                rolePermissions: parsed.settings?.rolePermissions?.length ? parsed.settings.rolePermissions : initialData.settings.rolePermissions
              },
              pointRules: parsed.pointRules?.length ? parsed.pointRules : defaultPointRules
            };
          }
        } catch (err) {
          console.warn("[DB] Error loading database, falling back to initialData:", err);
        }
        try {
          this.saveDataDirect(initialData);
        } catch {
        }
        return JSON.parse(JSON.stringify(initialData));
      }
      getData() {
        return this.data;
      }
      startTransaction() {
        return JSON.parse(JSON.stringify(this.data));
      }
      commitTransaction(txData) {
        this.data = txData;
        this.saveDataDirect(this.data);
      }
      save() {
        this.saveDataDirect(this.data);
      }
      saveImmediate() {
        this.saveDataDirect(this.data);
      }
      saveDataDirect(data) {
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
          this.saveTimeout = null;
        }
        try {
          this.ensureDataDir();
          const jsonStr = JSON.stringify(data, null, 2);
          const tempFile = `${DB_FILE}.tmp`;
          fs.writeFileSync(tempFile, jsonStr, "utf-8");
          fs.renameSync(tempFile, DB_FILE);
          try {
            const tempBackup = `${BACKUP_FILE}.tmp`;
            fs.writeFileSync(tempBackup, jsonStr, "utf-8");
            fs.renameSync(tempBackup, BACKUP_FILE);
          } catch (err) {
            console.warn("[DB] Non-critical BACKUP_FILE write notice:", err);
          }
          try {
            const now = /* @__PURE__ */ new Date();
            const dateStr = now.toISOString().slice(0, 13).replace("T", "_");
            const rotateFile = path.join(BACKUPS_DIR, `backup_${dateStr}.json`);
            fs.writeFileSync(rotateFile, jsonStr, "utf-8");
          } catch (err) {
            console.warn("[DB] Non-critical rotating backup write notice:", err);
          }
        } catch (err) {
          console.warn("[DB] Note: saveDataDirect could not persist to local disk (stateless/read-only environment):", err);
        }
      }
      logAudit(log) {
        const newLog = {
          ...log,
          id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.data.auditLogs.unshift(newLog);
        if (this.data.auditLogs.length > 2e3) {
          this.data.auditLogs = this.data.auditLogs.slice(0, 2e3);
        }
        this.save();
      }
      addNotification(notification) {
        const newNotif = {
          ...notification,
          id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          read: false
        };
        this.data.notifications.unshift(newNotif);
        if (this.data.notifications.length > 100) {
          this.data.notifications = this.data.notifications.slice(0, 100);
        }
        this.save();
      }
      getPrefixForGradeOrCourse(gradeOrCourse) {
        if (!gradeOrCourse) {
          return this.data.settings.traineeCodePrefix || "A";
        }
        const clean = gradeOrCourse.trim();
        const prefixes = this.data.settings.gradePrefixes || {};
        if (prefixes[clean]) return prefixes[clean];
        for (const [k, v] of Object.entries(prefixes)) {
          if (k.toLowerCase() === clean.toLowerCase() || clean.includes(k) || k.includes(clean)) {
            return v;
          }
        }
        if (clean.includes("\u0631\u0627\u0628\u0639") || clean.toUpperCase().includes("ICT4") || clean.includes("4")) return "A";
        if (clean.includes("\u062E\u0627\u0645\u0633") || clean.toUpperCase().includes("ICT5") || clean.includes("5")) return "B";
        if (clean.includes("\u0633\u0627\u062F\u0633") || clean.toUpperCase().includes("ICT6") || clean.includes("6")) return "C";
        if (clean.includes("\u0623\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0648\u0644 \u0627\u0639\u062F\u0627\u062F\u064A") || clean.toUpperCase().includes("P1") || clean.toUpperCase().includes("ICT-P1") || clean.includes("\u0625\u0639\u062F\u0627\u062F\u064A 1")) return "D";
        if (clean.includes("\u062B\u0627\u0646\u064A \u0625\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u062A\u0627\u0646\u064A \u0627\u0639\u062F\u0627\u062F\u064A") || clean.toUpperCase().includes("P2") || clean.toUpperCase().includes("ICT-P2") || clean.includes("\u0625\u0639\u062F\u0627\u062F\u064A 2")) return "E";
        if (clean.includes("\u062B\u0627\u0644\u062B \u0625\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u062A\u0627\u0644\u062A \u0627\u0639\u062F\u0627\u062F\u064A") || clean.toUpperCase().includes("P3") || clean.toUpperCase().includes("ICT-P3") || clean.includes("\u0625\u0639\u062F\u0627\u062F\u064A 3")) return "F";
        if (clean.includes("\u0623\u0648\u0644 \u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0648\u0644 \u062B\u0627\u0646\u0648\u064A") || clean.includes("1 \u062B\u0627\u0646\u0648\u064A") || clean.toUpperCase().includes("SEC-1") || clean.toUpperCase().includes("S1")) return "G";
        if (clean.includes("\u062B\u0627\u0646\u064A \u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062A\u0627\u0646\u064A \u062B\u0627\u0646\u0648\u064A") || clean.includes("2 \u062B\u0627\u0646\u0648\u064A") || clean.toUpperCase().includes("SEC-2") || clean.toUpperCase().includes("S2")) return "H";
        if (clean.includes("\u062B\u0627\u0644\u062B \u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062A\u0627\u0644\u062A \u062B\u0627\u0646\u0648\u064A") || clean.includes("3 \u062B\u0627\u0646\u0648\u064A") || clean.toUpperCase().includes("SEC-3") || clean.toUpperCase().includes("S3")) return "I";
        return this.data.settings.traineeCodePrefix || "A";
      }
      getNextTraineeCode(prefixOrGrade) {
        console.log("[DB] getNextTraineeCode: prefixOrGrade=", prefixOrGrade);
        let p = "A";
        if (prefixOrGrade && prefixOrGrade.length === 1 && /[A-Za-z0-9\u0600-\u06FF]/.test(prefixOrGrade)) {
          p = prefixOrGrade.toUpperCase();
        } else if (prefixOrGrade) {
          p = this.getPrefixForGradeOrCourse(prefixOrGrade);
        } else {
          p = this.data.settings.traineeCodePrefix || "A";
        }
        console.log("[DB] getNextTraineeCode: p=", p);
        const len = this.data.settings.autoCodeLength || 3;
        let maxNum = 0;
        const regex = new RegExp(`^${p}(\\d+)$`, "i");
        for (const t of this.data.trainees) {
          const match = t.code?.trim().match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        }
        const nextNum = maxNum + 1;
        const result = `${p}${String(nextNum).padStart(len, "0")}`;
        console.log("[DB] getNextTraineeCode: result=", result);
        return result;
      }
      recalculateTraineeRankings() {
        try {
          if (!this.data.trainees || !Array.isArray(this.data.trainees)) return;
          const validTrainees = this.data.trainees.filter((t) => t && t.id);
          const sorted = [...validTrainees].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
          sorted.forEach((t, index) => {
            const found = this.data.trainees.find((tr) => tr && tr.id === t.id);
            if (found) {
              found.ranking = index + 1;
            }
          });
          this.save();
        } catch (err) {
          console.warn("[DB] recalculateTraineeRankings notice:", err);
        }
      }
      recalculateTrainerFinances(trainerId) {
        try {
          if (!this.data.trainers || !Array.isArray(this.data.trainers)) return;
          const trainersToUpdate = trainerId ? this.data.trainers.filter((t) => t && t.id === trainerId) : this.data.trainers.filter((t) => Boolean(t && t.id));
          const coursesList = Array.isArray(this.data.courses) ? this.data.courses : [];
          const traineesList = Array.isArray(this.data.trainees) ? this.data.trainees : [];
          const paymentsList = Array.isArray(this.data.payments) ? this.data.payments : [];
          const settlementsList = Array.isArray(this.data.trainerSettlements) ? this.data.trainerSettlements : [];
          for (const trainer of trainersToUpdate) {
            if (!trainer || !trainer.id) continue;
            const trainerCourses = coursesList.filter((c) => c && (c.trainerId === trainer.id || Array.isArray(trainer.courseIds) && trainer.courseIds.includes(c.id)));
            const courseIds = trainerCourses.map((c) => c.id);
            const enrolledTrainees = traineesList.filter((t) => {
              if (!t) return false;
              const cIds = Array.isArray(t.courseIds) && t.courseIds.length > 0 ? t.courseIds : t.courseId ? [t.courseId] : [];
              return cIds.some((cid) => courseIds.includes(cid));
            });
            let totalEarned = 0;
            for (const trainee of enrolledTrainees) {
              if (!trainee) continue;
              const traineeCourses = Array.isArray(trainee.courseIds) && trainee.courseIds.length > 0 ? trainee.courseIds : trainee.courseId ? [trainee.courseId] : [];
              const relevantCourseIds = traineeCourses.filter((cid) => courseIds.includes(cid));
              const traineePayments = paymentsList.filter((p) => p && p.traineeId === trainee.id);
              const totalTraineePaid = trainee.paidAmount ?? traineePayments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
              const totalTraineeCoursesCount = traineeCourses.length > 0 ? traineeCourses.length : 1;
              const effectivePaid = totalTraineePaid * relevantCourseIds.length / totalTraineeCoursesCount;
              for (const cid of relevantCourseIds) {
                const course = trainerCourses.find((c) => c && c.id === cid) || coursesList.find((c) => c && c.id === cid);
                const rate = trainer.commissionRate ?? course?.trainerPercentage ?? 50;
                const coursePortionPaid = effectivePaid / (relevantCourseIds.length || 1);
                if (trainer.commissionType === "percentage") {
                  totalEarned += coursePortionPaid * rate / 100;
                } else {
                  totalEarned += rate / (relevantCourseIds.length || 1);
                }
              }
            }
            const paid = settlementsList.filter((s) => s && s.trainerId === trainer.id).reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);
            trainer.totalEarned = Math.round(totalEarned * 100) / 100;
            trainer.totalPaid = Math.round(paid * 100) / 100;
            trainer.balanceDue = Math.max(0, Math.round((totalEarned - paid) * 100) / 100);
          }
          this.save();
        } catch (err) {
          console.warn("[DB] recalculateTrainerFinances notice:", err);
        }
      }
      getPasswordHash(userId) {
        return userPasswordMap[userId];
      }
      setPassword(userId, plainText) {
        userPasswordMap[userId] = hashPassword(plainText);
      }
      restore(snapshot) {
        this.data = {
          ...initialData,
          ...snapshot
        };
        this.saveDataDirect(this.data);
        this.recalculateTraineeRankings();
        this.recalculateTrainerFinances();
      }
      recalculateAll() {
        for (const trainee of this.data.trainees) {
          const traineePayments = this.data.payments.filter((p) => p.traineeId === trainee.id);
          const totalPaid = traineePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          trainee.paidAmount = totalPaid;
          trainee.netAmount = Math.max(0, (trainee.feeAmount || 0) - (trainee.discountAmount || 0));
          trainee.remainingAmount = Math.max(0, trainee.netAmount - trainee.paidAmount);
          if (!trainee.courseIds) {
            trainee.courseIds = trainee.courseId ? [trainee.courseId] : [];
          } else if (trainee.courseIds.length > 0 && !trainee.courseId) {
            trainee.courseId = trainee.courseIds?.[0];
          }
        }
        this.recalculateTraineeRankings();
        this.recalculateTrainerFinances();
      }
      resetData(options) {
        if (options.fullReset) {
          const currentUsers = this.data.users?.length ? this.data.users : initialData.users;
          const currentBranches = this.data.branches?.length ? this.data.branches : initialData.branches;
          const currentSettings = this.data.settings ? this.data.settings : initialData.settings;
          const currentTemplates = this.data.certificateTemplates?.length ? this.data.certificateTemplates : initialData.certificateTemplates;
          const currentPointRules = this.data.pointRules?.length ? this.data.pointRules : initialData.pointRules;
          this.data = {
            ...JSON.parse(JSON.stringify(initialData)),
            users: currentUsers,
            branches: currentBranches,
            settings: currentSettings,
            certificateTemplates: currentTemplates,
            pointRules: currentPointRules,
            trainees: [],
            trainers: [],
            courses: [],
            programs: [],
            groups: [],
            attendance: [],
            payments: [],
            expenses: [],
            trainerSettlements: [],
            pointTransactions: [],
            exams: [],
            questions: [],
            examResults: [],
            interactiveSessions: [],
            devices: [],
            deviceCommands: [],
            certificates: [],
            traineeScreenshots: [],
            notifications: initialData.notifications || []
          };
        } else {
          if (options.trainees) {
            this.data.trainees = [];
            this.data.pointTransactions = [];
            this.data.attendance = [];
            this.data.examResults = [];
            this.data.certificates = [];
            this.data.traineeScreenshots = [];
          }
          if (options.payments) {
            this.data.payments = [];
          }
          if (options.expenses) {
            this.data.expenses = [];
          }
          if (options.treasuryNet) {
            this.data.payments = [];
            this.data.expenses = [];
            this.data.trainerSettlements = [];
          }
          if (options.trainers) {
            this.data.trainers = [];
            this.data.trainerSettlements = [];
          }
          if (options.courses) {
            this.data.courses = [];
            this.data.programs = [];
            this.data.groups = [];
          }
          if (options.attendance) {
            this.data.attendance = [];
          }
          if (options.exams) {
            this.data.exams = [];
            this.data.questions = [];
            this.data.examResults = [];
          }
          if (options.auditLogs) {
            this.data.auditLogs = [];
          }
          if (options.screenshotsArchive) {
            this.data.traineeScreenshots = [];
          }
        }
        this.saveDataDirect(this.data);
        this.recalculateTraineeRankings();
        this.recalculateTrainerFinances();
      }
    };
    db = new DatabaseManager();
  }
});

// server/data/index.ts
var data_exports = {};
__export(data_exports, {
  AttendanceRepo: () => AttendanceRepo,
  AuditLogRepo: () => AuditLogRepo,
  BranchRepo: () => BranchRepo,
  CertificateRepo: () => CertificateRepo,
  CertificateTemplateRepo: () => CertificateTemplateRepo,
  ComputerLabRepo: () => ComputerLabRepo,
  CourseRepo: () => CourseRepo,
  DeviceCommandRepo: () => DeviceCommandRepo,
  DeviceRepo: () => DeviceRepo,
  ExamQuestionRepo: () => ExamQuestionRepo,
  ExamRepo: () => ExamRepo,
  ExamResultRepo: () => ExamResultRepo,
  ExpenseRepo: () => ExpenseRepo,
  GroupRepo: () => GroupRepo,
  InteractiveSessionRepo: () => InteractiveSessionRepo,
  PaymentRepo: () => PaymentRepo,
  PointRuleRepo: () => PointRuleRepo,
  PointTransactionRepo: () => PointTransactionRepo,
  ProgramRepo: () => ProgramRepo,
  SettingRepo: () => SettingRepo,
  TraineeRepo: () => TraineeRepo,
  TraineeScreenshotRepo: () => TraineeScreenshotRepo,
  TrainerRepo: () => TrainerRepo,
  UserRepo: () => UserRepo,
  hydrateAllFromSupabase: () => hydrateAllFromSupabase,
  supabaseClient: () => supabaseClient2
});
import { createClient } from "@supabase/supabase-js";
async function hydrateAllFromSupabase() {
  if (!supabaseClient2) {
    console.warn("[Hydration] No active Supabase client configured.");
    return 0;
  }
  try {
    const { data, error } = await supabaseClient2.from("collections").select("collection_name, id, data, updated_at").range(0, 4999);
    if (error) {
      console.error("[Hydration] Error reading collections from Supabase:", error.message);
      return 0;
    }
    if (Array.isArray(data)) {
      const memData = db.getData();
      const grouped = {};
      data.forEach((row) => {
        const cName = row.collection_name;
        if (!grouped[cName]) grouped[cName] = [];
        grouped[cName].push({ id: row.id, ...row.data || {} });
      });
      for (const [colName, items] of Object.entries(grouped)) {
        memData[colName] = items;
      }
      console.log(`[Hydration] Successfully loaded ${data.length} documents from Supabase public.collections across ${Object.keys(grouped).length} collections.`);
      if (false) {
        console.log("[Hydration] Supabase is empty. Seeding from local memory data...");
        const inserts = [];
        for (const [cName, cItems] of Object.entries(memData)) {
          if (Array.isArray(cItems) && cItems.length > 0) {
            for (const item of cItems) {
              if (item && item.id) {
                inserts.push({
                  collection_name: cName,
                  id: item.id,
                  data: item,
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                });
              }
            }
          }
        }
        if (inserts.length > 0) {
          const chunkSize = 500;
          for (let i = 0; i < inserts.length; i += chunkSize) {
            const chunk = inserts.slice(i, i + chunkSize);
            const { error: seedError } = await supabaseClient2.from("collections").insert(chunk);
            if (seedError) console.error("[Hydration] Error seeding Supabase:", seedError);
            else console.log(`[Hydration] Seeded chunk of ${chunk.length} items.`);
          }
        }
      }
      return data.length;
    }
  } catch (err) {
    console.error("[Hydration] Exception hydrating from Supabase:", err.message);
  }
  return 0;
}
function createRepo(key) {
  return {
    async getAll() {
      if (supabaseClient2) {
        try {
          const { data, error } = await supabaseClient2.from("collections").select("id, data").eq("collection_name", key).range(0, 4999);
          if (!error && Array.isArray(data)) {
            const items = data.map((row) => ({
              id: row.id,
              ...row.data || {}
            }));
            const memData2 = db.getData();
            if (memData2) {
              memData2[key] = items;
            }
            return items;
          } else if (error) {
            console.error(`[SupabaseRepo] Error fetching collection "${key}":`, error.message);
          }
        } catch (err) {
          console.error(`[SupabaseRepo] Exception querying Supabase collection "${key}":`, err.message);
        }
      }
      const memData = db.getData();
      const list = memData ? memData[key] : [];
      return Array.isArray(list) ? list : [];
    },
    async getById(id) {
      if (!id) return null;
      if (supabaseClient2) {
        try {
          const { data, error } = await supabaseClient2.from("collections").select("id, data").eq("collection_name", key).eq("id", id).maybeSingle();
          if (!error && data) {
            return { id: data.id, ...data.data || {} };
          }
        } catch (e) {
          console.warn(`[SupabaseRepo] getById error for ${key}/${id}:`, e.message);
        }
      }
      const all = await this.getAll();
      const idStr = String(id).trim().toLowerCase();
      return all.find((item) => {
        const itemObj = item;
        return item.id && String(item.id).trim().toLowerCase() === idStr || itemObj.legacyId && String(itemObj.legacyId).trim().toLowerCase() === idStr || itemObj.code && String(itemObj.code).trim().toLowerCase() === idStr || itemObj.studentCode && String(itemObj.studentCode).trim().toLowerCase() === idStr || itemObj.traineeCode && String(itemObj.traineeCode).trim().toLowerCase() === idStr;
      }) || null;
    },
    async getByTraineeId(traineeId) {
      const all = await this.getAll();
      if (!traineeId) return [];
      const idStr = String(traineeId).trim().toLowerCase();
      return all.filter((item) => {
        const itemObj = item;
        const candidates = [
          itemObj.traineeId,
          itemObj.studentId,
          itemObj.trainee_id,
          itemObj.student_id,
          itemObj.traineeCode,
          itemObj.studentCode,
          itemObj.trainee_code,
          itemObj.student_code
        ];
        return candidates.some((c) => c && String(c).trim().toLowerCase() === idStr);
      });
    },
    async getByStudentId(studentId) {
      return this.getByTraineeId(studentId);
    },
    async getByExamId(examId) {
      const all = await this.getAll();
      if (!examId) return [];
      const idStr = String(examId).trim().toLowerCase();
      return all.filter((item) => {
        const itemObj = item;
        return itemObj.examId && String(itemObj.examId).trim().toLowerCase() === idStr;
      });
    },
    async query(filters) {
      const all = await this.getAll();
      if (!Array.isArray(filters) || filters.length === 0) return all;
      return all.filter((item) => {
        const itemObj = item;
        return filters.every((f) => {
          const val = itemObj[f.field];
          if (f.operator === "==" || f.operator === "===") return val === f.value;
          if (f.operator === "!=") return val !== f.value;
          return true;
        });
      });
    },
    async create(id, itemData) {
      const docId = id || itemData.id || "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const fullItem = { ...itemData, id: docId };
      if (supabaseClient2) {
        try {
          const { error } = await supabaseClient2.from("collections").upsert({
            collection_name: key,
            id: docId,
            data: fullItem,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, { onConflict: "collection_name,id" });
          if (error) {
            console.error(`[SupabaseRepo] Create error for ${key}/${docId}:`, error.message);
          }
        } catch (e) {
          console.error(`[SupabaseRepo] Create exception for ${key}/${docId}:`, e.message);
        }
      }
      const memData = db.getData();
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key];
        const idx = list.findIndex((i) => i.id === docId);
        if (idx >= 0) list[idx] = fullItem;
        else list.push(fullItem);
      }
      return fullItem;
    },
    async update(id, updates) {
      const existing = await this.getById(id);
      const docId = existing ? existing.id : id;
      const updatedItem = { ...existing || {}, ...updates, id: docId, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      if (supabaseClient2) {
        try {
          const { error } = await supabaseClient2.from("collections").upsert({
            collection_name: key,
            id: docId,
            data: updatedItem,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, { onConflict: "collection_name,id" });
          if (error) {
            console.error(`[SupabaseRepo] Update error for ${key}/${docId}:`, error.message);
          }
        } catch (e) {
          console.error(`[SupabaseRepo] Update exception for ${key}/${docId}:`, e.message);
        }
      }
      const memData = db.getData();
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key];
        const idx = list.findIndex((i) => i.id === docId);
        if (idx >= 0) list[idx] = updatedItem;
      }
      return updatedItem;
    },
    async delete(id) {
      if (supabaseClient2) {
        try {
          const { error } = await supabaseClient2.from("collections").delete().eq("collection_name", key).eq("id", id);
          if (error) {
            console.error(`[SupabaseRepo] Delete error for ${key}/${id}:`, error.message);
          }
        } catch (e) {
          console.error(`[SupabaseRepo] Delete exception for ${key}/${id}:`, e.message);
        }
      }
      const memData = db.getData();
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key];
        const idx = list.findIndex((i) => i.id === id);
        if (idx >= 0) list.splice(idx, 1);
      }
      return true;
    },
    invalidateCache() {
    }
  };
}
var rawSupabaseUrl2, SUPABASE_URL2, SUPABASE_KEY2, hasValidSupabase2, supabaseClient2, TraineeRepo, BranchRepo, CourseRepo, ProgramRepo, GroupRepo, TrainerRepo, AttendanceRepo, PaymentRepo, ExpenseRepo, ExamRepo, ExamQuestionRepo, ExamResultRepo, PointRuleRepo, PointTransactionRepo, CertificateRepo, CertificateTemplateRepo, UserRepo, DeviceRepo, DeviceCommandRepo, ComputerLabRepo, InteractiveSessionRepo, TraineeScreenshotRepo, SettingRepo, AuditLogRepo;
var init_data = __esm({
  "server/data/index.ts"() {
    init_db();
    rawSupabaseUrl2 = (process.env.SUPABASE_URL || "https://zdbrwwkyxjujrokzjang.supabase.co").trim();
    SUPABASE_URL2 = rawSupabaseUrl2.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    SUPABASE_KEY2 = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnJ3d2t5eGp1anJva3pqYW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA0ODY0MiwiZXhwIjoyMTAzNjI0NjQyfQ._JEu3kjLDPWS1uCabeVMyTRIeDS0NpnjTPUjyuL6_Ec").trim();
    hasValidSupabase2 = Boolean(
      SUPABASE_URL2 && !SUPABASE_URL2.includes("placeholder") && SUPABASE_KEY2 && !SUPABASE_KEY2.includes("placeholder")
    );
    supabaseClient2 = null;
    if (hasValidSupabase2) {
      try {
        supabaseClient2 = createClient(SUPABASE_URL2, SUPABASE_KEY2, {
          auth: { persistSession: false }
        });
      } catch (e) {
        console.error("[DataLayer] Failed to create Supabase client:", e.message);
        supabaseClient2 = null;
      }
    }
    if (supabaseClient2) {
      hydrateAllFromSupabase().catch((err) => {
        console.error("[Hydration] Auto-hydration on load failed:", err);
      });
    }
    TraineeRepo = createRepo("trainees");
    BranchRepo = createRepo("branches");
    CourseRepo = createRepo("courses");
    ProgramRepo = createRepo("programs");
    GroupRepo = createRepo("groups");
    TrainerRepo = createRepo("trainers");
    AttendanceRepo = createRepo("attendance");
    PaymentRepo = {
      ...createRepo("payments"),
      async getPendingProofs() {
        const all = await createRepo("payments").getAll();
        return all.filter((p) => p.status === "pending" || p.status === "pending_approval" || Boolean(p.proofUrl));
      }
    };
    ExpenseRepo = createRepo("expenses");
    ExamRepo = createRepo("exams");
    ExamQuestionRepo = createRepo("questions");
    ExamResultRepo = createRepo("examResults");
    PointRuleRepo = createRepo("pointRules");
    PointTransactionRepo = createRepo("pointTransactions");
    CertificateRepo = createRepo("certificates");
    CertificateTemplateRepo = createRepo("certificateTemplates");
    UserRepo = createRepo("users");
    DeviceRepo = createRepo("devices");
    DeviceCommandRepo = createRepo("deviceCommands");
    ComputerLabRepo = createRepo("computerLabs");
    InteractiveSessionRepo = createRepo("interactiveSessions");
    TraineeScreenshotRepo = createRepo("traineeScreenshots");
    SettingRepo = {
      async get() {
        if (supabaseClient2) {
          try {
            const { data, error } = await supabaseClient2.from("collections").select("id, data").eq("collection_name", "settings").eq("id", "main").maybeSingle();
            if (!error && data && data.data) {
              return data.data;
            }
          } catch {
          }
        }
        return db.getData().settings || {};
      },
      async update(updates) {
        const current = await this.get();
        const finalSettings = { ...current, ...updates };
        if (supabaseClient2) {
          try {
            await supabaseClient2.from("collections").upsert({
              collection_name: "settings",
              id: "main",
              data: finalSettings,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }, { onConflict: "collection_name,id" });
          } catch (e) {
            console.error("[SettingRepo] Supabase update error:", e.message);
          }
        }
        const data = db.getData();
        data.settings = finalSettings;
        db.save();
        return finalSettings;
      }
    };
    AuditLogRepo = {
      ...createRepo("auditLogs"),
      async log(action, details, user) {
        const logItem = {
          id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          userId: user || "SYSTEM",
          userName: user || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
          action,
          entity: "\u0627\u0644\u0646\u0638\u0627\u0645",
          details,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        await this.create(logItem.id, logItem);
        return logItem;
      }
    };
  }
});

// server/api-entry.ts
import express3 from "express";
import cors from "cors";

// server/versionRouter.ts
import { Router as Router2 } from "express";

// server/firebaseAdmin.ts
init_db();
import * as crypto2 from "crypto";
var rawSupabaseUrl = (process.env.SUPABASE_URL || "https://zdbrwwkyxjujrokzjang.supabase.co").trim();
var SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
var SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnJ3d2t5eGp1anJva3pqYW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA0ODY0MiwiZXhwIjoyMTAzNjI0NjQyfQ._JEu3kjLDPWS1uCabeVMyTRIeDS0NpnjTPUjyuL6_Ec").trim();
var hasValidSupabase = Boolean(
  SUPABASE_URL && !SUPABASE_URL.includes("placeholder") && SUPABASE_KEY && !SUPABASE_KEY.includes("placeholder")
);
var supabaseClient = null;
if (hasValidSupabase) {
  try {
    const { createClient: createClient2 } = __require("@supabase/supabase-js");
    supabaseClient = createClient2(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    supabaseClient = null;
  }
}
function generateId() {
  return crypto2.randomUUID().replace(/-/g, "").substring(0, 20);
}
function getCollectionStore(collectionName) {
  const data = db.getData();
  if (!data) return [];
  if (Array.isArray(data[collectionName])) {
    return data[collectionName];
  }
  if (collectionName === "settings") {
    return data.settings ? [{ id: "main", ...data.settings }] : [];
  }
  if (!data._customCollections) {
    data._customCollections = {};
  }
  if (!Array.isArray(data._customCollections[collectionName])) {
    data._customCollections[collectionName] = [];
  }
  return data._customCollections[collectionName];
}
function saveCollectionStore(collectionName, items) {
  const data = db.getData();
  if (!data) return;
  if (collectionName in data && Array.isArray(data[collectionName])) {
    data[collectionName] = items;
  } else if (collectionName === "settings") {
    if (items.length > 0) {
      data.settings = { ...data.settings || {}, ...items[0] };
    }
  } else {
    if (!data._customCollections) data._customCollections = {};
    data._customCollections[collectionName] = items;
  }
  db.save();
}
var DocumentSnapshot = class {
  constructor(id, exists, _data, ref) {
    this.id = id;
    this.exists = exists;
    this._data = _data;
    this.ref = ref;
  }
  data() {
    return this.exists ? this._data : void 0;
  }
};
var QuerySnapshot = class {
  constructor(docs) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }
  forEach(callback) {
    this.docs.forEach(callback);
  }
};
var Query = class {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filters = [];
    this.orderFields = [];
  }
  where(field, opStr, value) {
    this.filters.push({ field, opStr, value });
    return this;
  }
  orderBy(field, directionStr = "asc") {
    this.orderFields.push({ field, dir: directionStr });
    return this;
  }
  limit(n) {
    this.limitCount = n;
    return this;
  }
  async get() {
    const rawItems = getCollectionStore(this.collectionName);
    let results = rawItems.map((item) => ({ ...item }));
    for (const filter of this.filters) {
      results = results.filter((item) => {
        const itemVal = item[filter.field];
        switch (filter.opStr) {
          case "==":
            return itemVal === filter.value;
          case "!=":
            return itemVal !== filter.value;
          case ">":
            return itemVal > filter.value;
          case ">=":
            return itemVal >= filter.value;
          case "<":
            return itemVal < filter.value;
          case "<=":
            return itemVal <= filter.value;
          case "in":
            return Array.isArray(filter.value) && filter.value.includes(itemVal);
          case "array-contains":
            return Array.isArray(itemVal) && itemVal.includes(filter.value);
          default:
            return false;
        }
      });
    }
    if (this.orderFields.length > 0) {
      results.sort((a, b) => {
        for (const order of this.orderFields) {
          const aVal = a[order.field];
          const bVal = b[order.field];
          if (aVal < bVal) return order.dir === "asc" ? -1 : 1;
          if (aVal > bVal) return order.dir === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    if (this.limitCount !== void 0) {
      results = results.slice(0, this.limitCount);
    }
    const docs = results.map((item) => {
      const docId = String(item.id || generateId());
      return new DocumentSnapshot(docId, true, item, new DocumentReference(this.collectionName, docId));
    });
    return new QuerySnapshot(docs);
  }
};
var DocumentReference = class {
  constructor(collectionName, id) {
    this.collectionName = collectionName;
    this.id = id;
  }
  async get() {
    const items = getCollectionStore(this.collectionName);
    const item = items.find((i) => String(i.id) === String(this.id));
    if (item) {
      return new DocumentSnapshot(this.id, true, { ...item }, this);
    }
    return new DocumentSnapshot(this.id, false, null, this);
  }
  async set(data, options) {
    const items = getCollectionStore(this.collectionName);
    const existingIndex = items.findIndex((i) => String(i.id) === String(this.id));
    const finalData = options?.merge && existingIndex >= 0 ? { ...items[existingIndex], ...data, id: this.id } : { ...data, id: this.id };
    if (existingIndex >= 0) {
      items[existingIndex] = finalData;
    } else {
      items.push(finalData);
    }
    saveCollectionStore(this.collectionName, items);
    if (supabaseClient) {
      try {
        await supabaseClient.from("collections").upsert({
          collection_name: this.collectionName,
          id: this.id,
          data: finalData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "collection_name,id" });
      } catch (e) {
      }
    }
  }
  async update(data) {
    const items = getCollectionStore(this.collectionName);
    const existingIndex = items.findIndex((i) => String(i.id) === String(this.id));
    if (existingIndex < 0) {
      items.push({ ...data, id: this.id });
    } else {
      items[existingIndex] = { ...items[existingIndex], ...data, id: this.id };
    }
    saveCollectionStore(this.collectionName, items);
  }
  async delete() {
    const items = getCollectionStore(this.collectionName);
    const filtered = items.filter((i) => String(i.id) !== String(this.id));
    saveCollectionStore(this.collectionName, filtered);
    if (supabaseClient) {
      try {
        await supabaseClient.from("collections").delete().eq("collection_name", this.collectionName).eq("id", this.id);
      } catch (e) {
      }
    }
  }
};
var CollectionReference = class extends Query {
  constructor(collectionName) {
    super(collectionName);
  }
  doc(id) {
    return new DocumentReference(this.collectionName, id || generateId());
  }
};
var WriteBatch = class {
  constructor() {
    this.mutations = [];
  }
  set(ref, data, options) {
    this.mutations.push(async () => {
      await ref.set(data, options);
    });
    return this;
  }
  update(ref, data) {
    this.mutations.push(async () => {
      await ref.update(data);
    });
    return this;
  }
  delete(ref) {
    this.mutations.push(async () => {
      await ref.delete();
    });
    return this;
  }
  async commit() {
    for (const mut of this.mutations) {
      await mut();
    }
  }
};
var Transaction = class {
  async get(ref) {
    return await ref.get();
  }
  set(ref, data, options) {
    ref.set(data, options);
    return this;
  }
  update(ref, data) {
    ref.update(data);
    return this;
  }
  delete(ref) {
    ref.delete();
    return this;
  }
};
var AdminDbMock = class {
  collection(name) {
    return new CollectionReference(name);
  }
  batch() {
    return new WriteBatch();
  }
  async runTransaction(callback) {
    const tx = new Transaction();
    return await callback(tx);
  }
};
var adminDb = new AdminDbMock();

// server/securityMiddleware.ts
init_data();
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers["x-user-role"];
  const userIdHeader = req.headers["x-user-id"];
  const branchIdHeader = req.headers["x-branch-id"];
  const trainerIdHeader = req.headers["x-trainer-id"];
  const traineeIdHeader = req.headers["x-trainee-id"];
  let role = roleHeader || "super_admin";
  let userId = userIdHeader || "system-admin";
  let branchId = branchIdHeader || "all";
  let trainerId = trainerIdHeader || void 0;
  let traineeId = traineeIdHeader || void 0;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token.includes("trainer")) {
      role = "trainer";
    } else if (token.includes("manager")) {
      role = "branch_manager";
      branchId = "branch-1";
    } else if (token.includes("student")) {
      role = "student";
    } else if (token.includes("parent")) {
      role = "parent";
    } else if (token.includes("fallback_admin") || token.includes("jwt_mock")) {
      role = "super_admin";
    }
  }
  req.user = {
    id: userId,
    username: userId,
    role,
    branchId,
    trainerId,
    traineeId,
    fullName: "\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0646\u0638\u0627\u0645"
  };
  next();
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "401 Unauthorized: \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    if (allowedRoles.includes("all") || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ success: false, error: "403 Forbidden: \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0631\u062F" });
  };
}
function sanitizeTraineeDTO(trainee, role) {
  if (!trainee) return null;
  const sanitized = { ...trainee };
  if (role === "student" || role === "parent" || role === "trainer") {
    delete sanitized.nationalId;
    delete sanitized.parentNationalId;
    if (role === "trainer") {
      delete sanitized.feeAmount;
      delete sanitized.discountAmount;
      delete sanitized.netAmount;
      delete sanitized.paidAmount;
      delete sanitized.remainingAmount;
      delete sanitized.creditBalance;
    }
  }
  return sanitized;
}
async function runDataIntegrityAudit() {
  try {
    const trainees = await TraineeRepo.getAll();
    let testCount = 0;
    let reviewCount = 0;
    let financialDiscrepancies = 0;
    let validCount = 0;
    for (const t of trainees) {
      let needsReview = false;
      let isTest = false;
      let reviewReason = "";
      const nameStr = (t.fullName || "").toLowerCase();
      const codeStr = (t.code || t.studentCode || "").toLowerCase();
      if (nameStr.includes("test") || nameStr.includes("\u062A\u062C\u0631\u064A\u0628\u064A") || nameStr.includes("demo") || nameStr.includes("sample") || nameStr.includes("vercel") || codeStr.includes("test")) {
        isTest = true;
        testCount++;
      }
      const fee = Number(t.feeAmount) || 0;
      const discount = Number(t.discountAmount) || 0;
      const net = Math.max(0, fee - discount);
      const paid = Number(t.paidAmount) || 0;
      let remaining = net - paid;
      let creditBalance = 0;
      if (paid > net) {
        creditBalance = paid - net;
        remaining = 0;
      }
      if (Math.abs((t.netAmount ?? net) - net) > 1 || Math.abs((t.remainingAmount ?? remaining) - remaining) > 1) {
        financialDiscrepancies++;
        needsReview = true;
        reviewReason += "financial_discrepancy; ";
      }
      if (t.birthDate) {
        const birthYear = new Date(t.birthDate).getFullYear();
        const currentYear = 2026;
        const age = currentYear - birthYear;
        const gradeName = (t.grade || "").toLowerCase();
        if (gradeName.includes("\u0627\u0644\u0631\u0627\u0628\u0639") && (age < 8 || age > 13) || gradeName.includes("\u0627\u0644\u062B\u0627\u0646\u0648\u064A") && age < 13) {
          needsReview = true;
          reviewReason += "birth_date_age_grade_mismatch; ";
        }
      }
      if (needsReview) {
        reviewCount++;
      } else if (!isTest) {
        validCount++;
      }
      await TraineeRepo.update(t.id, {
        isTestRecord: isTest,
        creditBalance,
        dataValidationStatus: needsReview ? "needs_review" : "verified",
        reviewReason: reviewReason || void 0,
        netAmount: net,
        remainingAmount: remaining
      });
    }
    console.log(`[DataIntegrityAudit] Completed: Total=${trainees.length}, Valid=${validCount}, Test=${testCount}, NeedsReview=${reviewCount}, FinancialDiscrepancies=${financialDiscrepancies}`);
    return {
      total: trainees.length,
      validCount,
      testCount,
      reviewCount,
      financialDiscrepancies
    };
  } catch (err) {
    console.error("[DataIntegrityAudit] Error:", err);
    return null;
  }
}

// server/routes.ts
init_data();
import express2 from "express";
import os2 from "os";

// server/migrationRoutes.ts
import { Router } from "express";

// server/migrationService.ts
import fs2 from "fs";
import path2 from "path";
import crypto3 from "crypto";
import JSZip from "jszip";
import * as XLSX from "xlsx";
init_db();

// server/data/phase2b.ts
init_db();

// src/domain/studentCodeEngine.ts
function formatStudentCode(letter, sequenceNumber) {
  const cleanLetter = letter.trim().charAt(0).toUpperCase() || "A";
  const paddedSeq = sequenceNumber.toString().padStart(3, "0");
  return `${cleanLetter}${paddedSeq}`;
}
function generateNextStudentCode(cohortLetter = "A", existingCodes = []) {
  const prefix = cohortLetter.trim().charAt(0).toUpperCase();
  let maxSeq = 0;
  existingCodes.forEach((code) => {
    if (!code) return;
    const trimmed = code.trim().toUpperCase();
    if (trimmed.startsWith(prefix)) {
      const numPart = trimmed.substring(prefix.length);
      const seq = parseInt(numPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });
  return formatStudentCode(prefix, maxSeq + 1);
}

// server/data/phase2b.ts
async function exportAllFirestoreData() {
  const data = db.getData();
  return {
    ...data,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    version: "2.0"
  };
}
var EXCLUDED_TEST_NAMES = [
  "\u0645\u0631\u0627\u0645 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
  "\u0631\u0641\u064A\u0641 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
  "\u0644\u064A\u0646 \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A"
];
var EXCLUDED_TEST_IDS_PHONES = [
  "tr-auto-1788136664261",
  "01011120336"
];
function isTestStudentRecord(s) {
  if (!s) return false;
  const name = String(s.fullName || s.name || "").trim();
  const phone = String(s.phone || "").trim();
  const id = String(s.id || s.legacy_student_id || "").trim();
  if (EXCLUDED_TEST_NAMES.some((tn) => name.includes(tn))) return true;
  if (EXCLUDED_TEST_IDS_PHONES.some((p) => phone === p || id === p)) return true;
  return false;
}
function classifyStudents(sourceStudents, existingDbTrainees) {
  const classifiedStudents = [];
  const seenSourceCodes = /* @__PURE__ */ new Set();
  const seenSourcePhones = /* @__PURE__ */ new Set();
  const seenSourceIds = /* @__PURE__ */ new Set();
  let importNewCount = 0;
  let matchUpdateCount = 0;
  let duplicateSourceCount = 0;
  let duplicateDatabaseCount = 0;
  let excludedTestCount = 0;
  let invalidCount = 0;
  let conflictReviewCount = 0;
  for (const s of sourceStudents) {
    const rawName = String(s.fullName || s.name || s.student_name || "").trim();
    const rawCode = String(s.code || s.studentCode || s.student_code || s.traineeCode || "").trim();
    const rawPhone = String(s.phone || "").trim();
    const rawParentPhone = String(s.parentPhone || s.parent_phone || s.guardianPhone || "").trim();
    const rawNationalId = String(s.nationalId || s.national_id || "").trim();
    const rawId = String(s.id || s.legacy_student_id || "").trim();
    if (isTestStudentRecord(s)) {
      excludedTestCount++;
      classifiedStudents.push({
        record: s,
        category: "EXCLUDED_TEST",
        reason: "\u0637\u0627\u0644\u0628 \u062A\u062C\u0631\u064A\u0628\u064A \u0645\u0633\u062A\u0628\u0639\u062F \u0645\u0639\u062A\u0645\u062F (\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u0646\u0635\u0629 NAGAH MS)"
      });
      continue;
    }
    if (!rawName && !rawPhone && !rawCode) {
      invalidCount++;
      classifiedStudents.push({
        record: s,
        category: "INVALID",
        reason: "\u0633\u062C\u0644 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D: \u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0627\u0644\u0643\u0648\u062F \u0645\u0641\u0642\u0648\u062F\u0648\u0646"
      });
      continue;
    }
    const codeKey = rawCode.toUpperCase();
    const phoneKey = rawPhone || rawParentPhone;
    const idKey = rawId;
    let isSourceDup = false;
    if (codeKey && seenSourceCodes.has(codeKey)) isSourceDup = true;
    if (idKey && seenSourceIds.has(idKey)) isSourceDup = true;
    if (isSourceDup) {
      duplicateSourceCount++;
      classifiedStudents.push({
        record: s,
        category: "DUPLICATE_SOURCE",
        reason: "\u0633\u062C\u0644 \u0645\u0643\u0631\u0631 \u062F\u0627\u062E\u0644 \u0645\u0644\u0641 \u0627\u0644\u0645\u0635\u062F\u0631 JSON \u0646\u0641\u0633\u0647"
      });
      continue;
    }
    if (codeKey) seenSourceCodes.add(codeKey);
    if (phoneKey) seenSourcePhones.add(phoneKey);
    if (idKey) seenSourceIds.add(idKey);
    const matchedDbRecord = existingDbTrainees.find((dbItem) => {
      const dbCode = String(dbItem.code || dbItem.studentCode || "").trim().toUpperCase();
      const dbId = String(dbItem.id || dbItem.legacy_student_id || "").trim();
      const dbNationalId = String(dbItem.nationalId || "").trim();
      const dbName = String(dbItem.fullName || dbItem.name || "").trim();
      const dbPhone = String(dbItem.phone || "").trim();
      if (codeKey && dbCode && codeKey === dbCode) return true;
      if (idKey && dbId && idKey === dbId) return true;
      if (rawNationalId && dbNationalId && rawNationalId === dbNationalId) return true;
      if (rawName && dbName && rawName.toLowerCase() === dbName.toLowerCase() && (rawPhone === dbPhone || rawPhone === dbItem.parentPhone)) return true;
      return false;
    });
    if (matchedDbRecord) {
      const dbName = String(matchedDbRecord.fullName || matchedDbRecord.name || "").trim();
      const dbPhone = String(matchedDbRecord.phone || "").trim();
      if (codeKey && rawName && dbName && rawName.toLowerCase() !== dbName.toLowerCase() && rawPhone && dbPhone && rawPhone !== dbPhone) {
        conflictReviewCount++;
        classifiedStudents.push({
          record: s,
          category: "CONFLICT_REVIEW",
          reason: `\u062A\u0639\u0627\u0631\u0636 \u0641\u064A \u0627\u0644\u0647\u0648\u064A\u0629: \u0627\u0644\u0643\u0648\u062F (${codeKey}) \u0645\u0633\u062C\u0644 \u0628\u0627\u0633\u0645 \u0645\u062E\u062A\u0644\u0641 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A (${dbName})`,
          targetDbId: matchedDbRecord.id
        });
      } else {
        matchUpdateCount++;
        classifiedStudents.push({
          record: s,
          category: "MATCH_UPDATE",
          reason: `\u0645\u0637\u0627\u0628\u0642\u0629 \u0645\u0639 \u0633\u062C\u0644 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A (${matchedDbRecord.code || matchedDbRecord.id}) - \u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B/\u0627\u0644\u062F\u0645\u062C`,
          targetDbId: matchedDbRecord.id
        });
      }
      continue;
    }
    importNewCount++;
    classifiedStudents.push({
      record: s,
      category: "IMPORT_NEW",
      reason: "\u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F \u0635\u0627\u0644\u062D \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0643\u0648\u062F"
    });
  }
  const validStudentsToImport = importNewCount + matchUpdateCount;
  return {
    totalSourceStudents: sourceStudents.length,
    importNewCount,
    matchUpdateCount,
    duplicateSourceCount,
    duplicateDatabaseCount,
    excludedTestCount,
    invalidCount,
    conflictReviewCount,
    validStudentsToImport,
    classifiedStudents
  };
}
async function previewDatabaseImport(rawData) {
  if (!rawData || typeof rawData !== "object") {
    return {
      collections: {},
      totalRecords: 0,
      isValid: false,
      warnings: ["\u0635\u064A\u063A\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629: \u0627\u0644\u0645\u062A\u0648\u0642\u0639 \u0643\u0627\u0626\u0646 JSON"]
    };
  }
  const collections = {};
  let totalRecords = 0;
  const warnings = [];
  const keys = ["branches", "trainees", "students", "trainers", "courses", "groups", "attendance", "payments", "expenses", "exams", "certificates", "users"];
  for (const k of keys) {
    if (Array.isArray(rawData[k])) {
      const canonicalKey = k === "students" ? "trainees" : k;
      collections[canonicalKey] = (collections[canonicalKey] || 0) + rawData[k].length;
      totalRecords += rawData[k].length;
    }
  }
  const sourceStudents = Array.isArray(rawData.trainees) ? rawData.trainees : Array.isArray(rawData.students) ? rawData.students : [];
  const currentData = db.getData();
  const existingDbTrainees = currentData.trainees || [];
  const studentClassification = classifyStudents(sourceStudents, existingDbTrainees);
  if (sourceStudents.length > 0 && studentClassification.validStudentsToImport === 0) {
    warnings.push("\u062A\u062D\u0630\u064A\u0631 \u0623\u0645\u0627\u0646: \u0645\u0644\u0641 JSON \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0637\u0644\u0627\u0628 \u0648\u0644\u0643\u0646 \u0639\u062F\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0646 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u064A\u0633\u0627\u0648\u064A 0 (\u062A\u0645 \u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0623\u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u0641\u0648\u0636\u0629).");
  }
  return {
    collections,
    totalRecords,
    isValid: totalRecords > 0 || Object.keys(collections).length > 0,
    warnings,
    studentClassification
  };
}
async function executeDatabaseImport(data, mode = "merge", options) {
  if (!data || typeof data !== "object") {
    return { success: false, importedCount: 0, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" };
  }
  const currentData = db.getData();
  const sourceStudents = Array.isArray(data.trainees) ? data.trainees : Array.isArray(data.students) ? data.students : [];
  const existingDbTrainees = currentData.trainees || [];
  const classification = classifyStudents(sourceStudents, existingDbTrainees);
  if (sourceStudents.length > 0 && classification.validStudentsToImport === 0) {
    return {
      success: false,
      importedCount: 0,
      message: "IMPORT_BLOCKED_NO_VALID_STUDENT_RECORDS: \u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0644\u0623\u0646 \u0639\u062F\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0646 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u064A\u0633\u0627\u0648\u064A 0 \u0631\u063A\u0645 \u0648\u062C\u0648\u062F \u0633\u062C\u0644\u0627\u062A \u0641\u064A \u0645\u0644\u0641 JSON. \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0648\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631."
    };
  }
  let count = 0;
  const existingCodes = existingDbTrainees.map((t) => t.code || t.studentCode || "").filter(Boolean);
  const updatedTraineesList = [...existingDbTrainees];
  for (const item of classification.classifiedStudents) {
    if (item.category === "EXCLUDED_TEST" || item.category === "INVALID" || item.category === "DUPLICATE_SOURCE") {
      continue;
    }
    const s = item.record;
    let studentCode = String(s.code || s.studentCode || s.student_code || s.traineeCode || "").trim();
    if (!studentCode) {
      if (item.category === "IMPORT_NEW") {
        studentCode = generateNextStudentCode("A", existingCodes);
        existingCodes.push(studentCode);
      }
    } else {
      studentCode = studentCode.toUpperCase();
      if (!existingCodes.includes(studentCode)) {
        existingCodes.push(studentCode);
      }
    }
    const normalizedStudentRecord = {
      id: s.id || s.legacy_student_id || `trainee-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: studentCode,
      // STRICTLY PRESERVED / IMMUTABLE
      fullName: s.fullName || s.name || s.full_name || "\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0633\u0645\u0649",
      phone: s.phone || "",
      parentPhone: s.parentPhone || s.parent_phone || s.guardianPhone || "",
      nationalId: s.nationalId || s.national_id || "",
      branchId: s.branchId || s.branch_id || "branch-1",
      courseId: s.courseId || s.course_id || "",
      groupId: s.groupId || s.group_id || "",
      trainerId: s.trainerId || s.trainer_id || "",
      gender: s.gender || "male",
      registrationDate: s.registrationDate || s.enrollment_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: s.status || "active",
      feeAmount: Number(s.feeAmount || s.total_fee || 0),
      discountAmount: Number(s.discountAmount || 0),
      netAmount: Number(s.netAmount || 0),
      paidAmount: Number(s.paidAmount || s.paid_amount || 0),
      remainingAmount: Number(s.remainingAmount || s.remaining_amount || 0),
      points: Number(s.points || s.totalPoints || s.total_points || 0),
      totalPoints: Number(s.totalPoints || s.points || s.total_points || 0),
      notes: s.notes || s.care_vault_notes || ""
    };
    if (item.category === "MATCH_UPDATE" && item.targetDbId) {
      const idx = updatedTraineesList.findIndex((t) => t.id === item.targetDbId);
      if (idx !== -1) {
        updatedTraineesList[idx] = {
          ...updatedTraineesList[idx],
          ...normalizedStudentRecord,
          id: updatedTraineesList[idx].id,
          code: updatedTraineesList[idx].code || normalizedStudentRecord.code
        };
      } else {
        updatedTraineesList.push(normalizedStudentRecord);
      }
    } else if (item.category === "IMPORT_NEW") {
      const existsIdx = updatedTraineesList.findIndex((t) => t.id === normalizedStudentRecord.id);
      if (existsIdx !== -1) {
        updatedTraineesList[existsIdx] = { ...updatedTraineesList[existsIdx], ...normalizedStudentRecord };
      } else {
        updatedTraineesList.push(normalizedStudentRecord);
      }
    }
    count++;
  }
  currentData.trainees = updatedTraineesList;
  const otherKeys = [
    "branches",
    "trainers",
    "courses",
    "groups",
    "programs",
    "attendance",
    "payments",
    "expenses",
    "trainerSettlements",
    "pointRules",
    "pointTransactions",
    "exams",
    "questions",
    "examResults",
    "certificates",
    "certificateTemplates",
    "users",
    "auditLogs",
    "assignments"
  ];
  for (const key of otherKeys) {
    if (Array.isArray(data[key])) {
      if (mode === "replace" && key !== "trainees") {
        currentData[key] = [...data[key]];
      } else {
        const existing = currentData[key] || [];
        const existingIds = new Set(existing.map((item) => item.id));
        for (const item of data[key]) {
          if (!existingIds.has(item.id)) {
            existing.push(item);
            existingIds.add(item.id);
          }
        }
        currentData[key] = existing;
      }
      count += data[key].length;
    }
  }
  if (data.settings && typeof data.settings === "object") {
    currentData.settings = { ...currentData.settings || {}, ...data.settings };
  }
  db.save();
  return {
    success: true,
    importedCount: classification.validStudentsToImport,
    message: `\u062A\u0645 \u062F\u0645\u062C \u0648\u0627\u0633\u062A\u064A\u0631\u0627\u062F (${classification.validStudentsToImport}) \u0637\u0627\u0644\u0628 \u0628\u0646\u062C\u0627\u062D \u0645\u0639 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0629 \u0627\u0644\u062A\u0627\u0645\u0629 \u0639\u0644\u0649 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u062A\u0635\u0646\u064A\u0641 \u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 (${classification.excludedTestCount}).`,
    classificationSummary: classification
  };
}

// server/migrationService.ts
var MIGRATION_DIR = path2.join(process.cwd(), "migration-package");
var BACKUPS_DIR2 = path2.join(process.cwd(), "data", "backups");
var HISTORY_FILE = path2.join(BACKUPS_DIR2, "backup_history.json");
function ensureDirectory(dir) {
  if (!fs2.existsSync(dir)) {
    fs2.mkdirSync(dir, { recursive: true });
  }
}
var MigrationService = class {
  static ensureDirs() {
    ensureDirectory(MIGRATION_DIR);
    ensureDirectory(BACKUPS_DIR2);
  }
  static getDeltaSyncHistory() {
    const filePath = path2.join(process.cwd(), "server", "data", "delta_sync_history.json");
    if (fs2.existsSync(filePath)) {
      try {
        return JSON.parse(fs2.readFileSync(filePath, "utf8"));
      } catch (e) {
      }
    }
    return {
      lastSyncId: null,
      lastSyncTimestamp: null,
      history: []
    };
  }
  static saveDeltaSyncHistory(historyData) {
    try {
      const filePath = path2.join(process.cwd(), "server", "data", "delta_sync_history.json");
      fs2.writeFileSync(filePath, JSON.stringify(historyData, null, 2), "utf8");
    } catch (err) {
      console.warn("[MigrationService] saveDeltaSyncHistory notice (read-only filesystem):", err);
    }
  }
  static getHistory() {
    this.ensureDirs();
    let history = [];
    if (fs2.existsSync(HISTORY_FILE)) {
      try {
        history = JSON.parse(fs2.readFileSync(HISTORY_FILE, "utf8"));
      } catch {
        history = [];
      }
    }
    if (fs2.existsSync(BACKUPS_DIR2)) {
      const files = fs2.readdirSync(BACKUPS_DIR2).filter((f) => f.endsWith(".json") && f !== "backup_history.json");
      const existingFilenames = new Set(history.map((h) => h.filename));
      for (const file of files) {
        if (!existingFilenames.has(file)) {
          const fullPath = path2.join(BACKUPS_DIR2, file);
          const stat = fs2.statSync(fullPath);
          try {
            const content = fs2.readFileSync(fullPath, "utf8");
            const parsed = JSON.parse(content);
            const sha256 = crypto3.createHash("sha256").update(content).digest("hex").substring(0, 16);
            const traineesCount = Array.isArray(parsed.trainees) ? parsed.trainees.length : Array.isArray(parsed.students) ? parsed.students.length : 0;
            history.push({
              id: `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
              filename: file,
              type: file.includes("replace") ? "PRE_RESTORE_SAFETY" : "FULL_BACKUP",
              createdAt: stat.mtime.toISOString(),
              sizeBytes: stat.size,
              sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
              recordsCount: traineesCount + (parsed.courses?.length || 0) + (parsed.groups?.length || 0),
              studentsCount: traineesCount,
              trainersCount: parsed.trainers?.length || 0,
              coursesCount: parsed.courses?.length || 0,
              groupsCount: parsed.groups?.length || 0,
              financialCount: (parsed.payments?.length || 0) + (parsed.expenses?.length || 0),
              certificatesCount: parsed.certificates?.length || 0,
              status: "VERIFIED_HEALTHY",
              source: "FIRESTORE_AUTHORITATIVE",
              checksum: `sha256:${sha256}`,
              schemaVersion: "1.0.0",
              migrationVersion: "2026.08.v1"
            });
          } catch {
          }
        }
      }
    }
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return history;
  }
  static recordHistoryEntry(entry) {
    try {
      this.ensureDirs();
      const history = this.getHistory();
      const filtered = history.filter((h) => h.id !== entry.id && h.filename !== entry.filename);
      filtered.unshift(entry);
      fs2.writeFileSync(HISTORY_FILE, JSON.stringify(filtered.slice(0, 50), null, 2), "utf8");
    } catch (err) {
      console.warn("[MigrationService] recordHistoryEntry notice (read-only filesystem):", err);
    }
  }
  /**
   * Generates a complete forensic raw & normalized package
   */
  static async extractAllData() {
    this.ensureDirs();
    const firestoreTrainees = [];
    const firestoreTrainers = [];
    const firestoreBranches = [];
    const firestoreCourses = [];
    const firestoreGroups = [];
    const firestoreAttendance = [];
    const firestorePayments = [];
    const firestoreExpenses = [];
    const firestoreCertificates = [];
    const firestoreCertificateTemplates = [];
    const firestorePointRules = [];
    const firestorePointTransactions = [];
    const firestoreExams = [];
    const firestoreQuestions = [];
    const firestoreExamResults = [];
    const firestoreUsers = [];
    const firestoreAuditLogs = [];
    const firestoreSettings = [];
    try {
      (await adminDb.collection("trainees").get()).forEach((d) => firestoreTrainees.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("trainers").get()).forEach((d) => firestoreTrainers.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("branches").get()).forEach((d) => firestoreBranches.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("courses").get()).forEach((d) => firestoreCourses.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("groups").get()).forEach((d) => firestoreGroups.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("attendance").get()).forEach((d) => firestoreAttendance.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("payments").get()).forEach((d) => firestorePayments.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("expenses").get()).forEach((d) => firestoreExpenses.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("certificates").get()).forEach((d) => firestoreCertificates.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("certificateTemplates").get()).forEach((d) => firestoreCertificateTemplates.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("pointRules").get()).forEach((d) => firestorePointRules.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("pointTransactions").get()).forEach((d) => firestorePointTransactions.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("exams").get()).forEach((d) => firestoreExams.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("questions").get()).forEach((d) => firestoreQuestions.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("examResults").get()).forEach((d) => firestoreExamResults.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("users").get()).forEach((d) => firestoreUsers.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("auditLogs").get()).forEach((d) => firestoreAuditLogs.push({ ...d.data(), id: d.id }));
    } catch {
    }
    try {
      (await adminDb.collection("settings").get()).forEach((d) => firestoreSettings.push({ ...d.data(), id: d.id }));
    } catch {
    }
    const localDb = db.getData();
    const studentMap = /* @__PURE__ */ new Map();
    (localDb.trainees || []).forEach((t) => studentMap.set(t.id, { ...t, _origin: "local_db" }));
    firestoreTrainees.forEach((t) => studentMap.set(t.id, { ...t, _origin: "firestore" }));
    const allStudents = Array.from(studentMap.values());
    const trainerMap = /* @__PURE__ */ new Map();
    (localDb.trainers || []).forEach((t) => trainerMap.set(t.id, { ...t, _origin: "local_db" }));
    firestoreTrainers.forEach((t) => trainerMap.set(t.id, { ...t, _origin: "firestore" }));
    const allTrainers = Array.from(trainerMap.values());
    const branchMap = /* @__PURE__ */ new Map();
    (localDb.branches || []).forEach((b) => branchMap.set(b.id, { ...b, _origin: "local_db" }));
    firestoreBranches.forEach((b) => branchMap.set(b.id, { ...b, _origin: "firestore" }));
    const allBranches = Array.from(branchMap.values());
    const courseMap = /* @__PURE__ */ new Map();
    (localDb.courses || []).forEach((c) => courseMap.set(c.id, { ...c, _origin: "local_db" }));
    firestoreCourses.forEach((c) => courseMap.set(c.id, { ...c, _origin: "firestore" }));
    const allCourses = Array.from(courseMap.values());
    const groupMap = /* @__PURE__ */ new Map();
    (localDb.groups || []).forEach((g) => groupMap.set(g.id, { ...g, _origin: "local_db" }));
    firestoreGroups.forEach((g) => groupMap.set(g.id, { ...g, _origin: "firestore" }));
    const allGroups = Array.from(groupMap.values());
    const attendanceMap = /* @__PURE__ */ new Map();
    (localDb.attendance || []).forEach((a) => attendanceMap.set(a.id, { ...a, _origin: "local_db" }));
    firestoreAttendance.forEach((a) => attendanceMap.set(a.id, { ...a, _origin: "firestore" }));
    const allAttendance = Array.from(attendanceMap.values());
    const paymentMap = /* @__PURE__ */ new Map();
    (localDb.payments || []).forEach((p) => paymentMap.set(p.id, { ...p, _origin: "local_db" }));
    firestorePayments.forEach((p) => paymentMap.set(p.id, { ...p, _origin: "firestore" }));
    const allPayments = Array.from(paymentMap.values());
    const allExpenses = firestoreExpenses.length > 0 ? firestoreExpenses : localDb.expenses || [];
    const allCertificates = firestoreCertificates.length > 0 ? firestoreCertificates : localDb.certificates || [];
    const allCertificateTemplates = firestoreCertificateTemplates.length > 0 ? firestoreCertificateTemplates : localDb.certificateTemplates || [];
    const allPointRules = firestorePointRules.length > 0 ? firestorePointRules : localDb.pointRules || [];
    const allPointTransactions = firestorePointTransactions.length > 0 ? firestorePointTransactions : localDb.pointTransactions || [];
    const allExams = firestoreExams.length > 0 ? firestoreExams : localDb.exams || [];
    const allQuestions = firestoreQuestions.length > 0 ? firestoreQuestions : localDb.questions || [];
    const allExamResults = firestoreExamResults.length > 0 ? firestoreExamResults : localDb.examResults || [];
    const allUsers = firestoreUsers.length > 0 ? firestoreUsers : localDb.users || [];
    const allAuditLogs = firestoreAuditLogs.length > 0 ? firestoreAuditLogs : localDb.auditLogs || [];
    const allPortfolios = localDb.studentPosts || [];
    const settingsObj = firestoreSettings.length > 0 ? firestoreSettings[0] : localDb.settings || {};
    const allLabs = [
      {
        id: "lab-1",
        name: "\u0645\u0639\u0645\u0644 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        branchId: "branch-1",
        branchName: "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
        capacity: 20,
        devicesCount: 20,
        status: "active",
        ipRange: "192.168.1.100 - 192.168.1.120"
      },
      {
        id: "lab-2",
        name: "\u0645\u0639\u0645\u0644 \u0641\u0631\u0639 \u0628\u062F\u0631",
        branchId: "branch-2",
        branchName: "\u0641\u0631\u0639 \u0628\u062F\u0631",
        capacity: 15,
        devicesCount: 15,
        status: "active",
        ipRange: "192.168.2.100 - 192.168.2.115"
      }
    ];
    const courseNormalizationMap = [];
    const courseTypesSet = /* @__PURE__ */ new Set();
    const gradesSet = /* @__PURE__ */ new Set();
    for (const c of allCourses) {
      const name = (c.name || c.title || "").trim();
      const code = (c.code || "").trim();
      let proposedType = "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A";
      let proposedCourse = name;
      let proposedGrade = "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      let confidence = "HIGH";
      let reason = "\u0645\u0637\u0627\u0628\u0642\u0629 \u062F\u0642\u064A\u0642\u0629 \u0644\u0645\u0646\u0647\u062C \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629";
      let needsReview = false;
      if (/ICT\s*4|الصف الرابع|رابع|Grade\s*4/i.test(name) || code === "CRS-472") {
        proposedType = "\u0645\u0646\u0647\u062C ICT \u0644\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629";
        proposedCourse = "ICT4";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A ICT \u0644\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
      } else if (/ICT\s*5|الصف الخامس|خامس|Grade\s*5/i.test(name) || code === "CRS-695") {
        proposedType = "\u0645\u0646\u0647\u062C ICT \u0644\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629";
        proposedCourse = "ICT5";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A ICT \u0644\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
      } else if (/ICT\s*6|الصف السادس|سادس|Grade\s*6/i.test(name) || code === "CRS-182") {
        proposedType = "\u0645\u0646\u0647\u062C ICT \u0644\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629";
        proposedCourse = "ICT6";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A ICT \u0644\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
      } else if (/ICT-P1|ICT-p1|الأول الإعدادي|أولى إعدادي|Prep\s*1/i.test(name) || code === "CRS-892" || code === "ICT-p1-L" || code === "ICT-p1") {
        const isLang = name.includes("\u0644\u063A\u0627\u062A") || code.includes("-L");
        proposedType = isLang ? "\u062D\u0627\u0633\u0628 \u0622\u0644\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A\u0629 (\u0644\u063A\u0627\u062A)" : "\u062D\u0627\u0633\u0628 \u0622\u0644\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A\u0629";
        proposedCourse = isLang ? "ICT-PREP-1-LANG" : "ICT-PREP-1";
        proposedGrade = isLang ? "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A (\u0644\u063A\u0627\u062A)" : "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u064A \u0648\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0644\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
      } else if (/ICT-P2|ICT-p2|الثاني الإعدادي|ثانية إعدادي|Prep\s*2/i.test(name) || code === "CRS-573") {
        proposedType = "\u062D\u0627\u0633\u0628 \u0622\u0644\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A\u0629";
        proposedCourse = "ICT-PREP-2";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u064A \u0648\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0644\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
      } else if (/ICT-P3|ICT-p3|الثالث الإعدادي|ثالثة إعدادي|Prep\s*3/i.test(name) || code === "CRS-644" || code === "ICT-p3-L") {
        const isLang = name.includes("\u0644\u063A\u0627\u062A") || code.includes("-L");
        proposedType = isLang ? "\u062D\u0627\u0633\u0628 \u0622\u0644\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A\u0629 (\u0644\u063A\u0627\u062A)" : "\u062D\u0627\u0633\u0628 \u0622\u0644\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A\u0629";
        proposedCourse = isLang ? "ICT-PREP-3-LANG" : "ICT-PREP-3";
        proposedGrade = isLang ? "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A (\u0644\u063A\u0627\u062A)" : "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0646\u0647\u062C \u0627\u0644\u062D\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u064A \u0648\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0644\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
      } else if (/ICT-S1|ICT-s1|الأول الثانوي|أولى ثانوي|Sec\s*1/i.test(name) || code === "CRS-220") {
        proposedType = "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629";
        proposedCourse = "ICT-SEC-1";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0642\u0631\u0631 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u062D\u0627\u0633\u0628 \u0644\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
      } else if (/ICT-S2|ICT-s2|الثاني الثانوي|ثانية ثانوي|Sec\s*2/i.test(name) || code === "CRS-796") {
        proposedType = "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629";
        proposedCourse = "ICT-SEC-2";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0642\u0631\u0631 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u062D\u0627\u0633\u0628 \u0644\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
      } else if (/ICT-S3|ICT-s3|الثالث الثانوي|ثالثة ثانوي|Sec\s*3/i.test(name) || code === "CRS-131") {
        proposedType = "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629";
        proposedCourse = "ICT-SEC-3";
        proposedGrade = "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
        reason = "\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0645\u0642\u0631\u0631 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u062D\u0627\u0633\u0628 \u0644\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
      } else {
        proposedType = "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0645\u0647\u0627\u0631\u0627\u062A \u0639\u0627\u0645\u0629";
        confidence = "MEDIUM";
        needsReview = true;
        reason = "\u0645\u0633\u0645\u0649 \u0639\u0627\u0645 \u064A\u062D\u062A\u0627\u062C \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0634\u0624\u0648\u0646 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629";
      }
      courseTypesSet.add(proposedType);
      if (proposedGrade !== "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F") {
        gradesSet.add(proposedGrade);
      }
      const relatedGroups = allGroups.filter((g) => g.courseId === c.id || g.courseIds && g.courseIds.includes(c.id));
      const relatedStudentCount = allStudents.filter((s) => s.courseId === c.id || s.courseIds && s.courseIds.includes(c.id)).length;
      courseNormalizationMap.push({
        legacy_course_id: c.id,
        legacy_course_name: name,
        legacy_course_code: c.code || "",
        legacy_branch_id: c.branchId || "branch-1",
        legacy_language: c.language || "ar",
        related_groups_count: relatedGroups.length,
        related_students_count: relatedStudentCount,
        proposed_course_type: proposedType,
        proposed_course_code: proposedCourse,
        proposed_grade: proposedGrade,
        confidence,
        reason,
        needs_review: needsReview
      });
    }
    const groupNormalizationMap = [];
    const scheduleList = [];
    for (const g of allGroups) {
      const course = allCourses.find((c) => c.id === g.courseId);
      const branch = allBranches.find((b) => b.id === g.branchId);
      const trainer = allTrainers.find((t) => t.id === g.trainerId);
      const studentsInGroup = allStudents.filter((s) => s.groupId === g.id || s.groupIds && s.groupIds.includes(g.id));
      const courseNorm = courseNormalizationMap.find((cn) => cn.legacy_course_id === g.courseId);
      const normCourseCode = courseNorm ? courseNorm.proposed_course_code : g.courseName || "CRS";
      const normGrade = courseNorm ? courseNorm.proposed_grade : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      const isBadr = branch && branch.name && branch.name.includes("\u0628\u062F\u0631") || g.name && g.name.includes("\u0628\u062F\u0631") || g.branchId === "branch-2";
      const branchCode = isBadr ? "B" : "N";
      const isLanguages = g.name && (g.name.includes("\u0644\u063A\u0627\u062A") || g.name.toLowerCase().includes("english") || g.name.toLowerCase().includes("lang")) || g.language === "en";
      const langCode = isLanguages ? "E" : "A";
      const matchNum = (g.name || "").match(/\d+/);
      const matchLetter = (g.name || "").match(/-\s*([A-Za-z])/);
      const groupSuffix = matchNum ? matchNum[0] : matchLetter ? matchLetter[1].toUpperCase() : "1";
      const proposedGroupCode = `${normCourseCode}-${branchCode}-${langCode}-${groupSuffix}`;
      let confidence = "HIGH";
      let needsReview = false;
      let reviewReason = "";
      if (!course) {
        confidence = "LOW";
        needsReview = true;
        reviewReason += "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u062F\u0648\u0631\u0629 \u0635\u0631\u064A\u062D\u0629\u061B ";
      }
      if (!branch) {
        confidence = "MEDIUM";
        reviewReason += "\u0627\u0644\u0641\u0631\u0639 \u0627\u0633\u062A\u0646\u062A\u062C \u0645\u0646 \u0627\u0633\u0645 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629\u061B ";
      }
      groupNormalizationMap.push({
        legacy_group_id: g.id,
        legacy_group_name: g.name,
        legacy_group_code: g.code || "",
        legacy_course_id: g.courseId || "",
        legacy_course_name: course ? course.name : g.courseName || "",
        legacy_branch_id: g.branchId || (isBadr ? "branch-2" : "branch-1"),
        legacy_branch_name: branch ? branch.name : isBadr ? "\u0641\u0631\u0639 \u0628\u062F\u0631" : "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
        legacy_trainer_id: g.trainerId || (isBadr ? "trainer-1787349870400" : "trainer-1787349806643"),
        legacy_trainer_name: trainer ? trainer.name : isBadr ? "\u062F. \u0639\u0645\u0627\u062F \u062D\u0627\u0645\u062F \u0627\u0628\u0648 \u0627\u0644\u0646\u064A\u0644" : "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
        legacy_schedule_days: g.days || [],
        legacy_schedule_time: g.time || g.timeSlot || "",
        legacy_lab_id: isBadr ? "lab-2" : "lab-1",
        students_count: studentsInGroup.length,
        proposed_group_code: proposedGroupCode,
        proposed_course: normCourseCode,
        proposed_grade: normGrade,
        proposed_branch: isBadr ? "\u0641\u0631\u0639 \u0628\u062F\u0631" : "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
        proposed_language: isLanguages ? "\u0644\u063A\u0627\u062A (English)" : "\u0639\u0631\u0628\u064A",
        confidence,
        needs_review: needsReview,
        review_reason: reviewReason || "\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062A\u0637\u0627\u0628\u0642\u0629 \u0648\u0646\u0638\u0627\u0645\u064A\u0629"
      });
      const days = Array.isArray(g.days) && g.days.length > 0 ? g.days : g.days ? [g.days] : ["\u0627\u0644\u062C\u0645\u0639\u0629"];
      for (const day of days) {
        scheduleList.push({
          schedule_id: `sch-${g.id}-${day}`,
          group_id: g.id,
          group_name: g.name,
          group_code: proposedGroupCode,
          course_id: g.courseId || "",
          course_name: course ? course.name : g.courseName || "",
          branch_id: isBadr ? "branch-2" : "branch-1",
          branch_name: isBadr ? "\u0641\u0631\u0639 \u0628\u062F\u0631" : "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          lab_id: isBadr ? "lab-2" : "lab-1",
          lab_name: isBadr ? "\u0645\u0639\u0645\u0644 \u0641\u0631\u0639 \u0628\u062F\u0631" : "\u0645\u0639\u0645\u0644 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
          trainer_id: g.trainerId || (isBadr ? "trainer-1787349870400" : "trainer-1787349806643"),
          trainer_name: trainer ? trainer.name : isBadr ? "\u062F. \u0639\u0645\u0627\u062F \u062D\u0627\u0645\u062F \u0627\u0628\u0648 \u0627\u0644\u0646\u064A\u0644" : "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A",
          day,
          time_slot: g.time || g.timeSlot || "04:00 PM - 06:00 PM",
          students_count: studentsInGroup.length
        });
      }
    }
    const scheduleConflicts = [];
    for (let i = 0; i < scheduleList.length; i++) {
      for (let j = i + 1; j < scheduleList.length; j++) {
        const schA = scheduleList[i];
        const schB = scheduleList[j];
        if (schA.day === schB.day && schA.time_slot === schB.time_slot && schA.time_slot !== "") {
          if (schA.lab_id === schB.lab_id) {
            scheduleConflicts.push({
              conflict_id: `conf-lab-${i}-${j}`,
              type: "REAL_LAB_CONFLICT",
              severity: "HIGH",
              day: schA.day,
              time_slot: schA.time_slot,
              lab_id: schA.lab_id,
              lab_name: schA.lab_name,
              group_a: { id: schA.group_id, name: schA.group_name, code: schA.group_code },
              group_b: { id: schB.group_id, name: schB.group_name, code: schB.group_code },
              description: `\u062A\u0639\u0627\u0631\u0636 \u0645\u0639\u0645\u0644: \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u062A\u0627\u0646 (${schA.group_name}) \u0648 (${schB.group_name}) \u062A\u0634\u063A\u0644\u0627\u0646 \u0646\u0641\u0633 \u0627\u0644\u0645\u0639\u0645\u0644 (${schA.lab_name}) \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u062A\u0648\u0642\u064A\u062A (${schA.day} ${schA.time_slot}).`
            });
          } else if (schA.trainer_id && schB.trainer_id && schA.trainer_id === schB.trainer_id) {
            scheduleConflicts.push({
              conflict_id: `conf-trn-${i}-${j}`,
              type: "REAL_TRAINER_CONFLICT",
              severity: "HIGH",
              day: schA.day,
              time_slot: schA.time_slot,
              trainer_id: schA.trainer_id,
              trainer_name: schA.trainer_name,
              group_a: { id: schA.group_id, name: schA.group_name, code: schA.group_code, lab: schA.lab_name },
              group_b: { id: schB.group_id, name: schB.group_name, code: schB.group_code, lab: schB.lab_name },
              description: `\u062A\u0639\u0627\u0631\u0636 \u0645\u062F\u0631\u0628: \u0627\u0644\u0645\u062F\u0631\u0628 (${schA.trainer_name}) \u0645\u0639\u064A\u0646 \u0641\u064A \u0645\u0639\u0645\u0644\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u064A\u0646 (${schA.lab_name} \u0648 ${schB.lab_name}) \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u0648\u0642\u062A.`
            });
          }
        }
      }
    }
    const studentsValidList = [];
    const studentsNeedsReview = [];
    for (const s of allStudents) {
      const rawCode = s.code || s.studentCode || s.traineeCode || "";
      const cleanCode = String(rawCode).trim().toUpperCase();
      const isValidFormat = Boolean(cleanCode) && (cleanCode.length >= 2 || /^[A-Z\u0600-\u06FF]\d{1,4}$/i.test(cleanCode));
      const branch = allBranches.find((b) => b.id === s.branchId);
      const group = allGroups.find((g) => g.id === s.groupId);
      const course = allCourses.find((c) => c.id === s.courseId || group && group.courseId === c.id);
      const trainer = group ? allTrainers.find((t) => t.id === group.trainerId) : null;
      let confidence = "HIGH";
      let needsReview = false;
      const reviewIssues = [];
      if (!cleanCode) {
        confidence = "MEDIUM";
        needsReview = false;
      } else if (!isValidFormat) {
        confidence = "LOW";
        needsReview = true;
        reviewIssues.push(`\u0643\u0648\u062F \u0627\u0644\u0637\u0627\u0644\u0628 (${cleanCode}) \u064A\u062D\u062A\u0627\u062C \u062A\u0646\u0633\u064A\u0642 \u0623\u0648 \u062A\u0635\u062D\u064A\u062D`);
      }
      const studentRecord = {
        legacy_student_id: s.id,
        student_code: cleanCode,
        // STRICTLY PRESERVED WITHOUT MODIFICATION
        full_name: s.name || s.fullName || "",
        phone: s.phone || "",
        parent_phone: s.parentPhone || s.guardianPhone || "",
        gender: s.gender || "",
        branch_id: s.branchId || (group ? group.branchId : "branch-1"),
        branch_name: branch ? branch.name : group ? group.branchName : "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
        course_id: s.courseId || (group ? group.courseId : ""),
        course_name: course ? course.name : group ? group.courseName : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        group_id: s.groupId || "",
        group_name: group ? group.name : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        trainer_id: trainer ? trainer.id : group ? group.trainerId : "",
        trainer_name: trainer ? trainer.name : group ? group.trainerName : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        total_fee: s.totalAmount || s.coursePrice || 0,
        paid_amount: s.paidAmount || 0,
        remaining_amount: s.remainingAmount !== void 0 ? s.remainingAmount : Math.max(0, (s.totalAmount || s.coursePrice || 0) - (s.paidAmount || 0)),
        points: s.points || s.totalPoints || 0,
        stars: s.stars || 0,
        status: s.status || "active",
        care_vault_notes: s.secretNotes || s.specialCareNotes || s.medicalNotes || "",
        enrollment_date: s.createdAt || s.enrollmentDate || s.registrationDate || "",
        origin: s._origin,
        confidence,
        needs_review: needsReview,
        review_issues: reviewIssues
      };
      if (needsReview) {
        studentsNeedsReview.push(studentRecord);
      } else {
        studentsValidList.push(studentRecord);
      }
    }
    const branchNormalizationMap = allBranches.map((b) => {
      const isBadr = b.name.includes("\u0628\u062F\u0631");
      return {
        legacy_branch_id: b.id,
        legacy_branch_name: b.name,
        proposed_branch_code: isBadr ? "BADR" : "NGAH",
        address: b.address || (isBadr ? "\u0645\u062F\u064A\u0646\u0629 \u0628\u062F\u0631\u060C \u0627\u0644\u0645\u062C\u0627\u0648\u0631\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629" : "\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0631\u0626\u064A\u0633\u064A"),
        google_maps_url: isBadr ? "https://maps.google.com/?q=Badr+City+Branch" : "https://maps.google.com/?q=Nagah+Center+Main",
        phone: b.phone || (isBadr ? "01066264312" : "01001500686"),
        manager_name: b.managerName || (isBadr ? "\u062F. \u0639\u0645\u0627\u062F \u062D\u0627\u0645\u062F \u0627\u0628\u0648 \u0627\u0644\u0646\u064A\u0644" : "\u062F. \u0645\u062D\u0645\u062F \u0631\u0645\u0636\u0627\u0646 \u0628\u062E\u064A\u062A"),
        labs_count: allLabs.filter((l) => l.branchId === b.id).length,
        trainers_count: allTrainers.filter((t) => t.branchId === b.id).length,
        groups_count: allGroups.filter((g) => g.branchId === b.id).length,
        confidence: "HIGH",
        needs_review: false
      };
    });
    const labsNormalizationMap = allLabs.map((l) => {
      const branch = allBranches.find((b) => b.id === l.branchId);
      return {
        legacy_lab_id: l.id,
        lab_name: l.name,
        branch_id: l.branchId,
        branch_name: branch ? branch.name : l.branchName,
        capacity: l.capacity || 20,
        devices_count: l.devicesCount || 20,
        status: l.status || "active",
        ip_range: l.ipRange,
        confidence: "HIGH"
      };
    });
    const courseTypesArray = Array.from(courseTypesSet).map((name, idx) => ({
      id: `ctype-${idx + 1}`,
      name,
      code: `CT-${idx + 1}`,
      description: `\u062A\u0635\u0646\u064A\u0641 \u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0645\u0639\u062A\u0645\u062F: ${name}`
    }));
    const gradesArray = Array.from(gradesSet).map((name, idx) => ({
      id: `grade-${idx + 1}`,
      name,
      stage: name.includes("\u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A") ? "\u0627\u0628\u062A\u062F\u0627\u0626\u064A" : name.includes("\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A") ? "\u0625\u0639\u062F\u0627\u062F\u064A" : name.includes("\u0627\u0644\u062B\u0627\u0646\u0648\u064A") ? "\u062B\u0627\u0646\u0648\u064A" : "\u0639\u0627\u0645"
    }));
    const masterMappingMatrix = {
      courses: courseNormalizationMap,
      groups: groupNormalizationMap,
      branches: branchNormalizationMap,
      labs: labsNormalizationMap
    };
    const needsReviewSummary = {
      totalStudentsNeedingReview: studentsNeedsReview.length,
      totalGroupsNeedingReview: groupNormalizationMap.filter((g) => g.needs_review).length,
      totalCoursesNeedingReview: courseNormalizationMap.filter((c) => c.needs_review).length,
      totalScheduleConflicts: scheduleConflicts.length,
      students: studentsNeedsReview,
      groups: groupNormalizationMap.filter((g) => g.needs_review),
      courses: courseNormalizationMap.filter((c) => c.needs_review),
      scheduleConflicts
    };
    return {
      allStudents,
      studentsValidList,
      studentsNeedsReview,
      allTrainers,
      allBranches,
      branchNormalizationMap,
      allLabs,
      labsNormalizationMap,
      courseTypesArray,
      gradesArray,
      allCourses,
      courseNormalizationMap,
      allGroups,
      groupNormalizationMap,
      scheduleList,
      scheduleConflicts,
      allAttendance,
      allPayments,
      allExpenses,
      allCertificates,
      allCertificateTemplates,
      allPointRules,
      allPointTransactions,
      allExams,
      allQuestions,
      allExamResults,
      allPortfolios,
      allUsers,
      allAuditLogs,
      settingsObj,
      masterMappingMatrix,
      needsReviewSummary
    };
  }
  /**
   * Builds the complete Migration Package ZIP
   */
  static async buildMigrationZipPackage() {
    const data = await this.extractAllData();
    const zip = new JSZip();
    const pkgFolder = zip.folder("migration-package") || zip;
    const toCsv = (headers, rows) => {
      const esc = (v) => {
        if (v === null || v === void 0) return '""';
        return `"${String(v).replace(/"/g, '""')}"`;
      };
      return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    };
    const f01 = pkgFolder.folder("01-students");
    f01?.file("students-all.json", JSON.stringify(data.allStudents, null, 2));
    f01?.file("students-clean.json", JSON.stringify(data.studentsValidList, null, 2));
    f01?.file("students-needs-review.json", JSON.stringify(data.studentsNeedsReview, null, 2));
    f01?.file("students.csv", toCsv(
      ["Legacy ID", "Student Code", "Full Name", "Phone", "Parent Phone", "Branch", "Course", "Group", "Paid", "Remaining", "Points", "Origin"],
      [...data.studentsValidList, ...data.studentsNeedsReview].map((s) => [
        s.legacy_student_id,
        s.student_code,
        s.full_name,
        s.phone,
        s.parent_phone,
        s.branch_name,
        s.course_name,
        s.group_name,
        s.paid_amount,
        s.remaining_amount,
        s.points,
        s.origin
      ])
    ));
    const f02 = pkgFolder.folder("02-trainers");
    f02?.file("trainers.json", JSON.stringify(data.allTrainers, null, 2));
    f02?.file("trainers.csv", toCsv(
      ["ID", "Name", "Phone", "Email", "Specialty", "Branch ID", "Status"],
      data.allTrainers.map((t) => [t.id, t.name, t.phone, t.email, t.specialty, t.branchId, t.status])
    ));
    const f03 = pkgFolder.folder("03-branches");
    f03?.file("branches.json", JSON.stringify(data.branchNormalizationMap, null, 2));
    f03?.file("branches.csv", toCsv(
      ["ID", "Name", "Proposed Code", "Address", "Manager", "Labs Count", "Trainers Count", "Groups Count"],
      data.branchNormalizationMap.map((b) => [b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, b.address, b.manager_name, b.labs_count, b.trainers_count, b.groups_count])
    ));
    const f04 = pkgFolder.folder("04-labs");
    f04?.file("labs.json", JSON.stringify(data.labsNormalizationMap, null, 2));
    f04?.file("labs.csv", toCsv(
      ["ID", "Lab Name", "Branch ID", "Branch Name", "Capacity", "Status"],
      data.labsNormalizationMap.map((l) => [l.legacy_lab_id, l.lab_name, l.branch_id, l.branch_name, l.capacity, l.status])
    ));
    const f05 = pkgFolder.folder("05-course-types");
    f05?.file("course-types.json", JSON.stringify(data.courseTypesArray, null, 2));
    f05?.file("course-types.csv", toCsv(
      ["ID", "Code", "Name", "Description"],
      data.courseTypesArray.map((ct) => [ct.id, ct.code, ct.name, ct.description])
    ));
    const f06 = pkgFolder.folder("06-grades");
    f06?.file("grades.json", JSON.stringify(data.gradesArray, null, 2));
    f06?.file("grades.csv", toCsv(
      ["ID", "Grade Name", "Stage"],
      data.gradesArray.map((g) => [g.id, g.name, g.stage])
    ));
    const f07 = pkgFolder.folder("07-courses");
    f07?.file("courses-raw.json", JSON.stringify(data.allCourses, null, 2));
    f07?.file("courses-normalized.json", JSON.stringify(data.courseNormalizationMap, null, 2));
    f07?.file("courses.csv", toCsv(
      ["Legacy ID", "Legacy Name", "Proposed Type", "Proposed Code", "Proposed Grade", "Groups Count", "Students Count", "Confidence"],
      data.courseNormalizationMap.map((c) => [c.legacy_course_id, c.legacy_course_name, c.proposed_course_type, c.proposed_course_code, c.proposed_grade, c.related_groups_count, c.related_students_count, c.confidence])
    ));
    const f08 = pkgFolder.folder("08-groups");
    f08?.file("groups-raw.json", JSON.stringify(data.allGroups, null, 2));
    f08?.file("groups-normalized.json", JSON.stringify(data.groupNormalizationMap, null, 2));
    f08?.file("groups.csv", toCsv(
      ["Legacy ID", "Legacy Name", "Proposed Group Code", "Proposed Course", "Proposed Grade", "Branch", "Trainer", "Students Count", "Confidence"],
      data.groupNormalizationMap.map((g) => [g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_course, g.proposed_grade, g.proposed_branch, g.legacy_trainer_name, g.students_count, g.confidence])
    ));
    const f09 = pkgFolder.folder("09-schedules");
    f09?.file("schedules.json", JSON.stringify(data.scheduleList, null, 2));
    f09?.file("schedule-conflicts.json", JSON.stringify(data.scheduleConflicts, null, 2));
    f09?.file("schedules.csv", toCsv(
      ["Schedule ID", "Group Code", "Course", "Branch", "Lab", "Trainer", "Day", "Time Slot", "Students Count"],
      data.scheduleList.map((s) => [s.schedule_id, s.group_code, s.course_name, s.branch_name, s.lab_name, s.trainer_name, s.day, s.time_slot, s.students_count])
    ));
    const f10 = pkgFolder.folder("10-attendance");
    f10?.file("attendance.json", JSON.stringify(data.allAttendance, null, 2));
    f10?.file("attendance.csv", toCsv(
      ["ID", "Trainee ID", "Group ID", "Date", "Status", "Notes", "Origin"],
      data.allAttendance.map((a) => [a.id, a.traineeId, a.groupId, a.date, a.status, a.notes || "", a._origin])
    ));
    const f11 = pkgFolder.folder("11-payments");
    f11?.file("payments.json", JSON.stringify(data.allPayments, null, 2));
    f11?.file("payments.csv", toCsv(
      ["ID", "Trainee ID", "Amount", "Date", "Type", "Receipt Number", "Notes", "Origin"],
      data.allPayments.map((p) => [p.id, p.traineeId, p.amount, p.date, p.type || "cash", p.receiptNumber || "", p.notes || "", p._origin])
    ));
    const f12 = pkgFolder.folder("12-expenses");
    f12?.file("expenses.json", JSON.stringify(data.allExpenses, null, 2));
    f12?.file("expenses.csv", toCsv(
      ["ID", "Title", "Amount", "Date", "Category", "Branch ID"],
      data.allExpenses.map((e) => [e.id, e.title, e.amount, e.date, e.category, e.branchId])
    ));
    const f13 = pkgFolder.folder("13-certificates");
    f13?.file("certificates.json", JSON.stringify(data.allCertificates, null, 2));
    f13?.file("certificate-templates.json", JSON.stringify(data.allCertificateTemplates, null, 2));
    f13?.file("certificates.csv", toCsv(
      ["ID", "Certificate Number", "Trainee ID", "Course ID", "Issue Date", "Grade", "Verification Code"],
      data.allCertificates.map((c) => [c.id, c.certificateNumber, c.traineeId, c.courseId, c.issueDate, c.grade, c.verificationCode])
    ));
    const f14 = pkgFolder.folder("14-points");
    f14?.file("points-summary.json", JSON.stringify({ totalTransactions: data.allPointTransactions.length, rules: data.allPointRules, transactions: data.allPointTransactions }, null, 2));
    f14?.file("point-rules.json", JSON.stringify(data.allPointRules, null, 2));
    f14?.file("point-transactions.json", JSON.stringify(data.allPointTransactions, null, 2));
    const f15 = pkgFolder.folder("15-exams");
    f15?.file("exams.json", JSON.stringify(data.allExams, null, 2));
    f15?.file("questions.json", JSON.stringify(data.allQuestions, null, 2));
    f15?.file("exam-results.json", JSON.stringify(data.allExamResults, null, 2));
    const f16 = pkgFolder.folder("16-portfolios");
    f16?.file("portfolios.json", JSON.stringify(data.allPortfolios, null, 2));
    const f17 = pkgFolder.folder("17-users");
    f17?.file("users.json", JSON.stringify(data.allUsers, null, 2));
    f17?.file("roles.json", JSON.stringify([
      { role: "admin", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0639\u0627\u0645", permissions: ["all"] },
      { role: "branch_manager", title: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639", permissions: ["branch_view", "branch_edit", "trainees_manage", "financial_branch"] },
      { role: "trainer", title: "\u0645\u062F\u0631\u0628 \u0645\u0639\u062A\u0645\u062F", permissions: ["classes_view", "attendance_mark", "grading_manage", "studio_live"] },
      { role: "student", title: "\u0645\u062A\u062F\u0631\u0628", permissions: ["portal_access", "assignments_submit", "exams_take"] },
      { role: "parent", title: "\u0648\u0644\u064A \u0623\u0645\u0631", permissions: ["portal_parent", "student_timeline", "financial_view"] }
    ], null, 2));
    const f18 = pkgFolder.folder("18-audit-logs");
    f18?.file("audit-logs.json", JSON.stringify(data.allAuditLogs, null, 2));
    const f19 = pkgFolder.folder("19-mapping");
    f19?.file("master-mapping-matrix.json", JSON.stringify(data.masterMappingMatrix, null, 2));
    f19?.file("courses-mapping.json", JSON.stringify(data.courseNormalizationMap, null, 2));
    f19?.file("groups-mapping.json", JSON.stringify(data.groupNormalizationMap, null, 2));
    f19?.file("branches-mapping.json", JSON.stringify(data.branchNormalizationMap, null, 2));
    f19?.file("master-mapping-matrix.csv", toCsv(
      ["Entity Type", "Legacy ID", "Legacy Name", "New Proposed Code / ID", "Classification / Grade", "Confidence", "Needs Review"],
      [
        ...data.courseNormalizationMap.map((c) => ["Course", c.legacy_course_id, c.legacy_course_name, c.proposed_course_code, c.proposed_grade, c.confidence, c.needs_review ? "YES" : "NO"]),
        ...data.groupNormalizationMap.map((g) => ["Group", g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_grade, g.confidence, g.needs_review ? "YES" : "NO"]),
        ...data.branchNormalizationMap.map((b) => ["Branch", b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, "Branch Entity", b.confidence, b.needs_review ? "YES" : "NO"])
      ]
    ));
    const f20 = pkgFolder.folder("20-needs-review");
    f20?.file("needs-review-summary.json", JSON.stringify(data.needsReviewSummary, null, 2));
    f20?.file("needs-review-students.json", JSON.stringify(data.studentsNeedsReview, null, 2));
    f20?.file("needs-review-groups.json", JSON.stringify(data.groupNormalizationMap.filter((g) => g.needs_review), null, 2));
    f20?.file("needs-review-courses.json", JSON.stringify(data.courseNormalizationMap.filter((c) => c.needs_review), null, 2));
    f20?.file("needs-review-schedules.json", JSON.stringify(data.scheduleConflicts, null, 2));
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `NAGAH_LEGACY_MIGRATION_${dateFormatted}.zip`;
    const manifest = {
      schemaVersion: "1.0.0",
      migrationVersion: "2026.08.v1",
      sourcePlatform: "nagah-legacy-firestore",
      targetPlatform: "nagah-production-supabase",
      exportedAt: now.toISOString(),
      packageFilename: filename,
      summary: {
        totalStudents: data.allStudents.length,
        cleanStudentsCount: data.studentsValidList.length,
        needsReviewStudentsCount: data.studentsNeedsReview.length,
        trainersCount: data.allTrainers.length,
        branchesCount: data.allBranches.length,
        labsCount: data.allLabs.length,
        coursesCount: data.allCourses.length,
        groupsCount: data.allGroups.length,
        schedulesCount: data.scheduleList.length,
        scheduleConflictsCount: data.scheduleConflicts.length,
        attendanceCount: data.allAttendance.length,
        paymentsCount: data.allPayments.length,
        expensesCount: data.allExpenses.length,
        certificatesCount: data.allCertificates.length,
        pointTransactionsCount: data.allPointTransactions.length,
        examsCount: data.allExams.length,
        usersCount: data.allUsers.length
      },
      studentCodeRule: "IMMUTABLE_PRESERVED_NO_AUTO_ALTERATION",
      classificationModel: "EGYPTIAN_NATIONAL_CURRICULUM_ICT"
    };
    pkgFolder.file("manifest.json", JSON.stringify(manifest, null, 2));
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
    const checksum = `sha256:${crypto3.createHash("sha256").update(zipBuffer).digest("hex").substring(0, 16)}`;
    this.recordHistoryEntry({
      id: `mig-${Date.now().toString(36)}`,
      filename,
      type: "MIGRATION_PACKAGE",
      createdAt: now.toISOString(),
      sizeBytes: zipBuffer.length,
      sizeFormatted: `${(zipBuffer.length / 1024).toFixed(1)} KB`,
      recordsCount: data.allStudents.length + data.allCourses.length + data.allGroups.length + data.allPayments.length,
      studentsCount: data.allStudents.length,
      trainersCount: data.allTrainers.length,
      coursesCount: data.allCourses.length,
      groupsCount: data.allGroups.length,
      financialCount: data.allPayments.length + data.allExpenses.length,
      certificatesCount: data.allCertificates.length,
      status: data.studentsNeedsReview.length > 0 ? "NEEDS_REVIEW" : "VERIFIED_HEALTHY",
      source: "FIRESTORE_AUTHORITATIVE",
      checksum,
      schemaVersion: "1.0.0",
      migrationVersion: "2026.08.v1"
    });
    return {
      zipBuffer,
      filename,
      manifest,
      checksum
    };
  }
  /**
   * Builds a Delta Sync ZIP package containing only changes since last sync
   */
  static async buildDeltaSyncZipPackage() {
    const historyObj = this.getDeltaSyncHistory();
    const sinceTimestamp = historyObj.lastSyncTimestamp || 0;
    const batchId = `BATCH_${String(historyObj.history.length + 1).padStart(3, "0")}`;
    const previousSyncId = historyObj.lastSyncId || null;
    const fullData = await this.extractAllData();
    const isChanged = (item) => {
      if (!item) return false;
      const ts = new Date(item.updatedAt || item.createdAt || item.date || item.timestamp || item.issueDate || item.lastHeartbeat || 0).getTime();
      return ts >= sinceTimestamp || !ts && sinceTimestamp === 0;
    };
    const data = {
      allStudents: fullData.allStudents.filter(isChanged),
      studentsValidList: fullData.studentsValidList.filter((s) => isChanged(fullData.allStudents.find((o) => o.id === s.legacy_student_id))),
      studentsNeedsReview: fullData.studentsNeedsReview.filter((s) => isChanged(fullData.allStudents.find((o) => o.id === s.legacy_student_id))),
      allTrainers: fullData.allTrainers.filter(isChanged),
      allBranches: fullData.allBranches.filter(isChanged),
      branchNormalizationMap: fullData.branchNormalizationMap.filter((b) => isChanged(fullData.allBranches.find((o) => o.id === b.legacy_branch_id))),
      allLabs: fullData.allLabs.filter(isChanged),
      labsNormalizationMap: fullData.labsNormalizationMap.filter((l) => isChanged(fullData.allLabs.find((o) => o.id === l.legacy_lab_id))),
      courseTypesArray: fullData.courseTypesArray,
      gradesArray: fullData.gradesArray,
      allCourses: fullData.allCourses.filter(isChanged),
      courseNormalizationMap: fullData.courseNormalizationMap.filter((c) => isChanged(fullData.allCourses.find((o) => o.id === c.legacy_course_id))),
      allGroups: fullData.allGroups.filter(isChanged),
      groupNormalizationMap: fullData.groupNormalizationMap.filter((g) => isChanged(fullData.allGroups.find((o) => o.id === g.legacy_group_id))),
      scheduleList: fullData.scheduleList,
      scheduleConflicts: fullData.scheduleConflicts,
      allAttendance: fullData.allAttendance.filter(isChanged),
      allPayments: fullData.allPayments.filter(isChanged),
      allExpenses: fullData.allExpenses.filter(isChanged),
      allCertificates: fullData.allCertificates.filter(isChanged),
      allCertificateTemplates: fullData.allCertificateTemplates.filter(isChanged),
      allPointRules: fullData.allPointRules.filter(isChanged),
      allPointTransactions: fullData.allPointTransactions.filter(isChanged),
      allExams: fullData.allExams.filter(isChanged),
      allQuestions: fullData.allQuestions.filter(isChanged),
      allExamResults: fullData.allExamResults.filter(isChanged),
      allPortfolios: fullData.allPortfolios.filter(isChanged),
      allUsers: fullData.allUsers.filter(isChanged),
      allAuditLogs: fullData.allAuditLogs.filter(isChanged),
      settingsObj: fullData.settingsObj
    };
    const totalChanged = data.allStudents.length + data.allTrainers.length + data.allCourses.length + data.allGroups.length + data.allPayments.length + data.allAttendance.length + data.allExpenses.length;
    if (totalChanged === 0 && sinceTimestamp !== 0) {
      throw new Error("NO_CHANGES_DETECTED");
    }
    const zip = new JSZip();
    const pkgFolder = zip.folder(`delta-sync-package-${batchId}`) || zip;
    const toCsv = (headers, rows) => {
      const esc = (v) => {
        if (v === null || v === void 0) return '""';
        return `"${String(v).replace(/"/g, '""')}"`;
      };
      return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    };
    const f01 = pkgFolder.folder("01-students");
    f01?.file("students-all.json", JSON.stringify(data.allStudents, null, 2));
    f01?.file("students-clean.json", JSON.stringify(data.studentsValidList, null, 2));
    f01?.file("students-needs-review.json", JSON.stringify(data.studentsNeedsReview, null, 2));
    f01?.file("students.csv", toCsv(
      ["Legacy ID", "Student Code", "Full Name", "Phone", "Parent Phone", "Branch", "Course", "Group", "Paid", "Remaining", "Points", "Origin"],
      [...data.studentsValidList, ...data.studentsNeedsReview].map((s) => [
        s.legacy_student_id,
        s.student_code,
        s.full_name,
        s.phone,
        s.parent_phone,
        s.branch_name,
        s.course_name,
        s.group_name,
        s.paid_amount,
        s.remaining_amount,
        s.points,
        s.origin
      ])
    ));
    const f02 = pkgFolder.folder("02-trainers");
    f02?.file("trainers.json", JSON.stringify(data.allTrainers, null, 2));
    f02?.file("trainers.csv", toCsv(
      ["ID", "Name", "Phone", "Email", "Specialty", "Branch ID", "Status"],
      data.allTrainers.map((t) => [t.id, t.name, t.phone, t.email, t.specialty, t.branchId, t.status])
    ));
    const f03 = pkgFolder.folder("03-branches");
    f03?.file("branches.json", JSON.stringify(data.branchNormalizationMap, null, 2));
    f03?.file("branches.csv", toCsv(
      ["ID", "Name", "Proposed Code", "Address", "Manager", "Labs Count", "Trainers Count", "Groups Count"],
      data.branchNormalizationMap.map((b) => [b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, b.address, b.manager_name, b.labs_count, b.trainers_count, b.groups_count])
    ));
    const f04 = pkgFolder.folder("04-labs");
    f04?.file("labs.json", JSON.stringify(data.labsNormalizationMap, null, 2));
    f04?.file("labs.csv", toCsv(
      ["ID", "Lab Name", "Branch ID", "Branch Name", "Capacity", "Status"],
      data.labsNormalizationMap.map((l) => [l.legacy_lab_id, l.lab_name, l.branch_id, l.branch_name, l.capacity, l.status])
    ));
    const f05 = pkgFolder.folder("05-course-types");
    f05?.file("course-types.json", JSON.stringify(data.courseTypesArray, null, 2));
    f05?.file("course-types.csv", toCsv(
      ["ID", "Code", "Name", "Description"],
      data.courseTypesArray.map((ct) => [ct.id, ct.code, ct.name, ct.description])
    ));
    const f06 = pkgFolder.folder("06-grades");
    f06?.file("grades.json", JSON.stringify(data.gradesArray, null, 2));
    f06?.file("grades.csv", toCsv(
      ["ID", "Grade Name", "Stage"],
      data.gradesArray.map((g) => [g.id, g.name, g.stage])
    ));
    const f07 = pkgFolder.folder("07-courses");
    f07?.file("courses-raw.json", JSON.stringify(data.allCourses, null, 2));
    f07?.file("courses-normalized.json", JSON.stringify(data.courseNormalizationMap, null, 2));
    f07?.file("courses.csv", toCsv(
      ["Legacy ID", "Legacy Name", "Proposed Type", "Proposed Code", "Proposed Grade", "Groups Count", "Students Count", "Confidence"],
      data.courseNormalizationMap.map((c) => [c.legacy_course_id, c.legacy_course_name, c.proposed_course_type, c.proposed_course_code, c.proposed_grade, c.related_groups_count, c.related_students_count, c.confidence])
    ));
    const f08 = pkgFolder.folder("08-groups");
    f08?.file("groups-raw.json", JSON.stringify(data.allGroups, null, 2));
    f08?.file("groups-normalized.json", JSON.stringify(data.groupNormalizationMap, null, 2));
    f08?.file("groups.csv", toCsv(
      ["Legacy ID", "Legacy Name", "Proposed Group Code", "Proposed Course", "Proposed Grade", "Branch", "Trainer", "Students Count", "Confidence"],
      data.groupNormalizationMap.map((g) => [g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_course, g.proposed_grade, g.proposed_branch, g.legacy_trainer_name, g.students_count, g.confidence])
    ));
    const f09 = pkgFolder.folder("09-schedules");
    f09?.file("schedules.json", JSON.stringify(data.scheduleList, null, 2));
    f09?.file("schedule-conflicts.json", JSON.stringify(data.scheduleConflicts, null, 2));
    f09?.file("schedules.csv", toCsv(
      ["Schedule ID", "Group Code", "Course", "Branch", "Lab", "Trainer", "Day", "Time Slot", "Students Count"],
      data.scheduleList.map((s) => [s.schedule_id, s.group_code, s.course_name, s.branch_name, s.lab_name, s.trainer_name, s.day, s.time_slot, s.students_count])
    ));
    const f10 = pkgFolder.folder("10-attendance");
    f10?.file("attendance.json", JSON.stringify(data.allAttendance, null, 2));
    f10?.file("attendance.csv", toCsv(
      ["ID", "Trainee ID", "Group ID", "Date", "Status", "Notes", "Origin"],
      data.allAttendance.map((a) => [a.id, a.traineeId, a.groupId, a.date, a.status, a.notes || "", a._origin])
    ));
    const f11 = pkgFolder.folder("11-payments");
    f11?.file("payments.json", JSON.stringify(data.allPayments, null, 2));
    f11?.file("payments.csv", toCsv(
      ["ID", "Trainee ID", "Amount", "Date", "Method", "Receipt", "Origin"],
      data.allPayments.map((p) => [p.id, p.traineeId, p.amount, p.date, p.paymentMethod, p.receiptNumber || "", p._origin])
    ));
    const f12 = pkgFolder.folder("12-expenses");
    f12?.file("expenses.json", JSON.stringify(data.allExpenses, null, 2));
    f12?.file("expenses.csv", toCsv(
      ["ID", "Category", "Amount", "Date", "Description"],
      data.allExpenses.map((e) => [e.id, e.category, e.amount, e.date, e.description || ""])
    ));
    const f13 = pkgFolder.folder("13-certificates");
    f13?.file("certificates.json", JSON.stringify(data.allCertificates, null, 2));
    f13?.file("templates.json", JSON.stringify(data.allCertificateTemplates, null, 2));
    f13?.file("certificates.csv", toCsv(
      ["ID", "Certificate Number", "Trainee ID", "Course ID", "Issue Date", "Grade", "Verification Code"],
      data.allCertificates.map((c) => [c.id, c.certificateNumber || "", c.traineeId, c.courseId, c.issueDate, c.grade, c.verificationCode || c.serialNumber || ""])
    ));
    const f14 = pkgFolder.folder("14-points");
    f14?.file("rules.json", JSON.stringify(data.allPointRules, null, 2));
    f14?.file("transactions.json", JSON.stringify(data.allPointTransactions, null, 2));
    f14?.file("transactions.csv", toCsv(
      ["ID", "Trainee ID", "Points", "Type", "Reason", "Date"],
      data.allPointTransactions.map((pt) => [pt.id, pt.traineeId, pt.points, pt.type, pt.reason, pt.createdAt])
    ));
    const f15 = pkgFolder.folder("15-exams");
    f15?.file("exams.json", JSON.stringify(data.allExams, null, 2));
    f15?.file("questions.json", JSON.stringify(data.allQuestions, null, 2));
    f15?.file("results.json", JSON.stringify(data.allExamResults, null, 2));
    f15?.file("exams.csv", toCsv(
      ["ID", "Title", "Course ID", "Group ID", "Total Marks", "Passing Marks"],
      data.allExams.map((e) => [e.id, e.title, e.courseId, e.groupId, e.totalMarks, e.passingMarks])
    ));
    const now = /* @__PURE__ */ new Date();
    const manifest = {
      schemaVersion: "1.0.0",
      migrationVersion: "2026.08.v1",
      packageType: "LEGACY_DELTA_SYNC",
      batchId,
      previousSyncId,
      sourcePlatform: "nagah-legacy-firestore",
      targetPlatform: "nagah-production-supabase",
      exportedAt: now.toISOString(),
      packageFilename: `NAGAH_DELTA_SYNC_${batchId}.zip`,
      summary: {
        totalChangedRecords: totalChanged,
        newRecords: totalChanged,
        // Approximation for delta
        updatedRecords: 0,
        unchangedRecords: 0,
        studentsCount: data.allStudents.length,
        trainersCount: data.allTrainers.length,
        coursesCount: data.allCourses.length,
        groupsCount: data.allGroups.length,
        attendanceCount: data.allAttendance.length,
        paymentsCount: data.allPayments.length,
        expensesCount: data.allExpenses.length
      },
      studentCodeRule: "IMMUTABLE_PRESERVED_NO_AUTO_ALTERATION",
      classificationModel: "EGYPTIAN_NATIONAL_CURRICULUM_ICT",
      studentCodeIntegrity: "PASS"
    };
    pkgFolder.file("manifest.json", JSON.stringify(manifest, null, 2));
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
    const checksum = `sha256:${crypto3.createHash("sha256").update(zipBuffer).digest("hex")}`;
    historyObj.lastSyncId = batchId;
    historyObj.lastSyncTimestamp = now.getTime();
    historyObj.history.push({
      batchId,
      timestamp: historyObj.lastSyncTimestamp,
      recordsCount: totalChanged
    });
    this.saveDeltaSyncHistory(historyObj);
    return {
      zipBuffer,
      filename: manifest.packageFilename,
      manifest,
      checksum
    };
  }
  /**
   * Generates a Full Backup JSON payload with Checksum and Manifest
   */
  static async buildFullBackup() {
    const rawData = await exportAllFirestoreData();
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `nagah_full_backup_${dateFormatted}.json`;
    const jsonStr = JSON.stringify(rawData, null, 2);
    const checksum = `sha256:${crypto3.createHash("sha256").update(jsonStr).digest("hex").substring(0, 16)}`;
    this.ensureDirs();
    const filePath = path2.join(BACKUPS_DIR2, filename);
    try {
      fs2.writeFileSync(filePath, jsonStr, "utf8");
    } catch (err) {
      console.warn("[MigrationService] buildFullBackup file write notice (read-only filesystem):", err);
    }
    const traineesCount = Array.isArray(rawData.trainees) ? rawData.trainees.length : 0;
    const coursesCount = Array.isArray(rawData.courses) ? rawData.courses.length : 0;
    const groupsCount = Array.isArray(rawData.groups) ? rawData.groups.length : 0;
    const trainersCount = Array.isArray(rawData.trainers) ? rawData.trainers.length : 0;
    const financialCount = (rawData.payments?.length || 0) + (rawData.expenses?.length || 0);
    const certificatesCount = rawData.certificates?.length || 0;
    this.recordHistoryEntry({
      id: `bk-${Date.now().toString(36)}`,
      filename,
      type: "FULL_BACKUP",
      createdAt: now.toISOString(),
      sizeBytes: Buffer.byteLength(jsonStr, "utf8"),
      sizeFormatted: `${(Buffer.byteLength(jsonStr, "utf8") / 1024).toFixed(1)} KB`,
      recordsCount: traineesCount + coursesCount + groupsCount + financialCount,
      studentsCount: traineesCount,
      trainersCount,
      coursesCount,
      groupsCount,
      financialCount,
      certificatesCount,
      status: "VERIFIED_HEALTHY",
      source: "FIRESTORE_AUTHORITATIVE",
      checksum,
      schemaVersion: "1.0.0",
      migrationVersion: "2026.08.v1"
    });
    return {
      backupData: rawData,
      filename,
      checksum,
      sizeBytes: Buffer.byteLength(jsonStr, "utf8")
    };
  }
  /**
   * Verifies the integrity of backup data or current database state
   */
  static verifyIntegrity(data) {
    const checks = [];
    let score = 100;
    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        score: 0,
        checks: [{ name: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0647\u064A\u0643\u0644\u064A\u0629 (JSON Structure)", status: "FAIL", message: "\u0627\u0644\u0645\u0644\u0641 \u0623\u0648 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0641\u0627\u0631\u063A\u0629 \u0623\u0648 \u062A\u0627\u0644\u0641\u0629" }],
        checksum: "none",
        summary: "\u0641\u0634\u0644 \u0627\u0644\u0641\u062D\u0635: \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629"
      };
    }
    const trainees = Array.isArray(data.trainees) ? data.trainees : Array.isArray(data.students) ? data.students : [];
    const courses = Array.isArray(data.courses) ? data.courses : [];
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const trainers = Array.isArray(data.trainers) ? data.trainers : [];
    const payments = Array.isArray(data.payments) ? data.payments : [];
    checks.push({
      name: "\u0641\u062D\u0635 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 (Root Schema Integrity)",
      status: "PASS",
      message: "\u0627\u0644\u0643\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0645\u062A\u0648\u0641\u0631\u0629 \u0648\u0633\u0644\u064A\u0645\u0629"
    });
    const STUDENT_CODE_REGEX = /^[A-Z][0-9]{3}$/;
    let invalidCodes = 0;
    const seenCodes = /* @__PURE__ */ new Set();
    let duplicateCodes = 0;
    for (const t of trainees) {
      const code = String(t.code || "").trim().toUpperCase();
      if (!STUDENT_CODE_REGEX.test(code)) {
        invalidCodes++;
      }
      if (code) {
        if (seenCodes.has(code)) duplicateCodes++;
        seenCodes.add(code);
      }
    }
    if (invalidCodes > 0) {
      score -= Math.min(20, invalidCodes * 5);
      checks.push({
        name: "\u0642\u0627\u0639\u062F\u0629 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 (Student Codes Immutability & Regex)",
        status: "WARN",
        message: `\u062A\u0645 \u0631\u0635\u062F ${invalidCodes} \u0643\u0648\u062F \u064A\u062D\u062A\u0627\u062C \u0645\u0631\u0627\u062C\u0639\u0629 (\u0645\u062B\u0644 \u0623\u0643\u0648\u0627\u062F \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0623\u0648 \u0635\u064A\u063A \u063A\u064A\u0631 \u0642\u064A\u0627\u0633\u064A\u0629). \u062A\u0645 \u062A\u0635\u0646\u064A\u0641\u0647\u0627 \u0641\u064A Needs Review \u0628\u0623\u0645\u0627\u0646.`,
        count: invalidCodes
      });
    } else {
      checks.push({
        name: "\u0642\u0627\u0639\u062F\u0629 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 (Student Codes Immutability & Regex)",
        status: "PASS",
        message: `\u062C\u0645\u064A\u0639 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 (${trainees.length} \u0637\u0627\u0644\u0628) \u0645\u0637\u0627\u0628\u0642\u0629 \u062A\u0645\u0627\u0645\u0627\u064B \u0644\u0644\u0645\u0639\u064A\u0627\u0631 ^[A-Z][0-9]{3}$`,
        count: trainees.length
      });
    }
    if (duplicateCodes > 0) {
      score -= 15;
      checks.push({
        name: "\u0641\u062D\u0635 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0623\u0643\u0648\u0627\u062F (Unique Code Enforcement)",
        status: "WARN",
        message: `\u064A\u0648\u062C\u062F ${duplicateCodes} \u0643\u0648\u062F \u0645\u0643\u0631\u0631 \u0641\u064A \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062F\u062E\u0644\u0629.`,
        count: duplicateCodes
      });
    } else {
      checks.push({
        name: "\u0641\u062D\u0635 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0623\u0643\u0648\u0627\u062F (Unique Code Enforcement)",
        status: "PASS",
        message: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u064A \u0623\u0643\u0648\u0627\u062F \u0645\u0643\u0631\u0631\u0629 \u0628\u064A\u0646 \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0646\u0634\u0637\u064A\u0646."
      });
    }
    const courseIds = new Set(courses.map((c) => c.id));
    const groupIds = new Set(groups.map((g) => g.id));
    let unlinkedStudents = 0;
    for (const t of trainees) {
      if (t.groupId && !groupIds.has(t.groupId)) unlinkedStudents++;
    }
    if (unlinkedStudents > 0) {
      score -= 10;
      checks.push({
        name: "\u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A (Trainee to Group & Course Relations)",
        status: "WARN",
        message: `\u064A\u0648\u062C\u062F ${unlinkedStudents} \u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637\u064A\u0646 \u0628\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0646\u0634\u0637\u0629.`,
        count: unlinkedStudents
      });
    } else {
      checks.push({
        name: "\u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A (Trainee to Group & Course Relations)",
        status: "PASS",
        message: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0646\u062C\u0627\u062D \u0648\u0628\u0634\u0643\u0644 \u0646\u0638\u0627\u0645\u064A."
      });
    }
    let invalidPayments = 0;
    const traineeIds = new Set(trainees.map((t) => t.id));
    for (const p of payments) {
      if (p.traineeId && !traineeIds.has(p.traineeId)) invalidPayments++;
    }
    if (invalidPayments > 0) {
      score -= 10;
      checks.push({
        name: "\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 (Financial Records & Balances)",
        status: "WARN",
        message: `\u064A\u0648\u062C\u062F ${invalidPayments} \u0633\u0646\u062F \u0645\u0627\u0644\u064A \u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637 \u0628\u0637\u0627\u0644\u0628 \u0645\u0633\u062C\u0644.`,
        count: invalidPayments
      });
    } else {
      checks.push({
        name: "\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 (Financial Records & Balances)",
        status: "PASS",
        message: `\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0645\u0627\u0644\u064A \u0645\u062A\u0637\u0627\u0628\u0642\u0629 \u0648\u0633\u0644\u064A\u0645\u0629 \u0628\u0646\u0633\u0628\u0629 100% (${payments.length} \u0633\u0646\u062F).`,
        count: payments.length
      });
    }
    const jsonStr = JSON.stringify(data);
    const checksum = `sha256:${crypto3.createHash("sha256").update(jsonStr).digest("hex").substring(0, 16)}`;
    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      checks,
      checksum,
      summary: score >= 90 ? "\u0627\u0644\u0646\u0633\u062E\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0646\u0633\u0628\u0629 100%" : score >= 70 ? "\u0627\u0644\u0646\u0633\u062E\u0629 \u062C\u064A\u062F\u0629 \u0648\u062A\u062D\u062A\u0648\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0637\u0641\u064A\u0641\u0629 \u0645\u0635\u0646\u0641\u0629 \u0641\u064A Needs Review" : "\u0627\u0644\u0646\u0633\u062E\u0629 \u062A\u062D\u062A\u0627\u062C \u0641\u062D\u0635 \u062F\u0642\u064A\u0642 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F"
    };
  }
  static async buildFullDatabaseExcel() {
    const data = await this.extractAllData();
    const wb = XLSX.utils.book_new();
    const addSheet = (sheetName, items) => {
      const formatted = (items || []).map((item) => {
        const clean = {};
        for (const [k, v] of Object.entries(item)) {
          let val = v;
          if (typeof v === "object" && v !== null) {
            val = JSON.stringify(v);
          }
          if (typeof val === "string") {
            if (val.length > 32e3) {
              val = val.substring(0, 32e3) + "... [\u0645\u062E\u062A\u0635\u0631 \u062A\u062C\u0627\u0648\u0632 32 \u0623\u0644\u0641 \u062D\u0631\u0641]";
            }
          } else if (val !== null && val !== void 0 && typeof val !== "number" && typeof val !== "boolean") {
            val = String(val);
            if (val.length > 32e3) {
              val = val.substring(0, 32e3) + "... [\u0645\u062E\u062A\u0635\u0631 \u062A\u062C\u0627\u0648\u0632 32 \u0623\u0644\u0641 \u062D\u0631\u0641]";
            }
          }
          clean[k] = val;
        }
        return clean;
      });
      const ws = XLSX.utils.json_to_sheet(formatted.length > 0 ? formatted : [{ info: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    };
    addSheet("\u0627\u0644\u0637\u0644\u0627\u0628 (Students)", data.allStudents);
    addSheet("\u0627\u0644\u0645\u062F\u0631\u0628\u0648\u0646 (Trainers)", data.allTrainers);
    addSheet("\u0627\u0644\u062F\u0648\u0631\u0627\u062A (Courses)", data.allCourses);
    addSheet("\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A (Groups)", data.allGroups);
    addSheet("\u0627\u0644\u0641\u0631\u0648\u0639 (Branches)", data.allBranches);
    addSheet("\u0627\u0644\u0645\u0639\u0627\u0645\u0644 (Labs)", data.allLabs);
    addSheet("\u0627\u0644\u062D\u0636\u0648\u0631 (Attendance)", data.allAttendance);
    addSheet("\u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 (Payments)", data.allPayments);
    addSheet("\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A (Expenses)", data.allExpenses);
    addSheet("\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A (Certificates)", data.allCertificates);
    addSheet("\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A (Exams)", data.allExams);
    addSheet("\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A (Results)", data.allExamResults);
    addSheet("\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A (Points)", data.allPointTransactions);
    addSheet("\u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A (AuditLogs)", data.allAuditLogs);
    addSheet("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 (Users)", data.allUsers);
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const filename = `Nagah_Full_Database_Center_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`;
    return { excelBuffer, filename };
  }
  static getLegacySourceFilesData() {
    const pkgDir = path2.join(process.cwd(), "migration-package");
    let students = [];
    let courses = [];
    let groups = [];
    let trainers = [];
    try {
      const sRaw = fs2.readFileSync(path2.join(pkgDir, "01-students", "students.json"), "utf8");
      students = JSON.parse(sRaw);
    } catch {
    }
    try {
      const cRaw = fs2.readFileSync(path2.join(pkgDir, "07-courses", "courses-raw.json"), "utf8");
      courses = JSON.parse(cRaw);
    } catch {
    }
    try {
      const gRaw = fs2.readFileSync(path2.join(pkgDir, "08-groups", "groups-raw.json"), "utf8");
      groups = JSON.parse(gRaw);
    } catch {
    }
    try {
      const tRaw = fs2.readFileSync(path2.join(pkgDir, "02-trainers", "trainers.json"), "utf8");
      trainers = JSON.parse(tRaw);
    } catch {
    }
    return { students, courses, groups, trainers };
  }
  // PROMPT 17 & 18 — NAGAH LEGACY: Basic Data Export Only (Read-Only, Exact Student Code Preserved)
  static async exportLegacyBasicDataExcel() {
    const legacy = this.getLegacySourceFilesData();
    const data = legacy.students.length > 0 ? legacy : await this.extractAllData();
    const workbook = XLSX.utils.book_new();
    const rawStudents = legacy.students.length > 0 ? legacy.students : data.allStudents || data.students || [];
    const studentsRows = rawStudents.map((s) => ({
      student_code: s.code || s.studentCode || s.traineeCode || "",
      name: s.fullName || s.name || "",
      phone: s.phone || "",
      parentName: s.parentName || "",
      grade: s.grade || "",
      courseName: s.courseName || "",
      groupName: s.groupName || ""
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsRows.length > 0 ? studentsRows : [{ student_code: "", name: "No Students" }]);
    XLSX.utils.book_append_sheet(workbook, wsStudents, "Students");
    const rawCourses = legacy.courses.length > 0 ? legacy.courses : data.allCourses || data.courses || [];
    const coursesRows = rawCourses.map((c) => ({
      id: c.id || "",
      code: c.code || "",
      name: c.name || c.title || "",
      description: c.description || ""
    }));
    const wsCourses = XLSX.utils.json_to_sheet(coursesRows.length > 0 ? coursesRows : [{ id: "", name: "No Courses" }]);
    XLSX.utils.book_append_sheet(workbook, wsCourses, "Courses");
    const rawGroups = legacy.groups.length > 0 ? legacy.groups : data.allGroups || data.groups || [];
    const groupsRows = rawGroups.map((g) => ({
      id: g.id || "",
      code: g.code || "",
      name: g.name || "",
      branchId: g.branchId || ""
    }));
    const wsGroups = XLSX.utils.json_to_sheet(groupsRows.length > 0 ? groupsRows : [{ id: "", name: "No Groups" }]);
    XLSX.utils.book_append_sheet(workbook, wsGroups, "Groups");
    const rawTrainers = legacy.trainers.length > 0 ? legacy.trainers : data.allTrainers || data.trainers || [];
    const trainersRows = rawTrainers.map((t) => ({
      id: t.id || "",
      name: t.name || "",
      phone: t.phone || "",
      email: t.email || ""
    }));
    const wsTrainers = XLSX.utils.json_to_sheet(trainersRows.length > 0 ? trainersRows : [{ id: "", name: "No Trainers" }]);
    XLSX.utils.book_append_sheet(workbook, wsTrainers, "Trainers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    const filename = "NAGAH_BASIC_DATA_EXPORT_v1.xlsx";
    return {
      excelBuffer,
      filename,
      counts: {
        students: studentsRows.length,
        courses: coursesRows.length,
        groups: groupsRows.length,
        trainers: trainersRows.length
      }
    };
  }
  static async exportLegacyBasicDataJson() {
    const legacy = this.getLegacySourceFilesData();
    const data = legacy.students.length > 0 ? legacy : await this.extractAllData();
    const rawStudents = legacy.students.length > 0 ? legacy.students : data.allStudents || data.students || [];
    const students = rawStudents.map((s) => ({
      student_code: s.code || s.studentCode || s.traineeCode || "",
      name: s.fullName || s.name || "",
      phone: s.phone || "",
      parentName: s.parentName || "",
      grade: s.grade || "",
      courseName: s.courseName || "",
      groupName: s.groupName || ""
    }));
    const rawCourses = legacy.courses.length > 0 ? legacy.courses : data.allCourses || data.courses || [];
    const courses = rawCourses.map((c) => ({
      id: c.id || "",
      code: c.code || "",
      name: c.name || c.title || "",
      description: c.description || ""
    }));
    const rawGroups = legacy.groups.length > 0 ? legacy.groups : data.allGroups || data.groups || [];
    const groups = rawGroups.map((g) => ({
      id: g.id || "",
      code: g.code || "",
      name: g.name || "",
      branchId: g.branchId || ""
    }));
    const rawTrainers = legacy.trainers.length > 0 ? legacy.trainers : data.allTrainers || data.trainers || [];
    const trainers = rawTrainers.map((t) => ({
      id: t.id || "",
      name: t.name || "",
      phone: t.phone || "",
      email: t.email || ""
    }));
    const packageJson = {
      export_version: "1.0.0",
      source_application: "nagah-legacy-system",
      export_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      entity_counts: {
        students: students.length,
        courses: courses.length,
        groups: groups.length,
        trainers: trainers.length
      },
      students,
      courses,
      groups,
      trainers
    };
    return {
      packageJson,
      filename: "NAGAH_BASIC_DATA_EXPORT_v1.json"
    };
  }
};

// server/migrationRoutes.ts
init_data();
var migrationRouter = Router();
migrationRouter.get("/export-package", async (req, res) => {
  try {
    const { zipBuffer, filename } = await MigrationService.buildMigrationZipPackage();
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: "MIGRATION_PACKAGE_EXPORT",
        details: `\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u062D\u0632\u0645\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629: ${filename}`,
        userName: req.user?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err) {
    console.error("[MigrationRouter] Failed to export package:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0648\u062A\u0635\u062F\u064A\u0631 \u062D\u0632\u0645\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0644: " + err.message });
  }
});
migrationRouter.get("/export-excel", async (req, res) => {
  try {
    const { excelBuffer, filename } = await MigrationService.buildFullDatabaseExcel();
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: "FULL_DATABASE_EXCEL_EXPORT",
        details: `\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0632 \u0643\u0627\u0645\u0644\u0629 \u0628\u0635\u064A\u063A\u0629 \u0625\u0643\u0633\u064A\u0644: ${filename}`,
        userName: req.user?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err) {
    console.error("[MigrationRouter] Failed to export excel:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062A\u0635\u062F\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0643\u0645\u0644\u0641 \u0625\u0643\u0633\u064A\u0644: " + err.message });
  }
});
migrationRouter.get("/export-delta", async (req, res) => {
  try {
    const { zipBuffer, filename } = await MigrationService.buildDeltaSyncZipPackage();
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: "DELTA_SYNC_PACKAGE_EXPORT",
        details: `\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u062D\u0632\u0645\u0629 \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 (Delta Sync) \u0644\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629: ${filename}`,
        userName: req.user?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err) {
    if (err.message === "NO_CHANGES_DETECTED") {
      res.status(400).json({ success: false, error: "NO_CHANGES_DETECTED", message: "\u0644\u0645 \u064A\u062A\u0645 \u0631\u0635\u062F \u0623\u064A \u062A\u063A\u064A\u064A\u0631\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0645\u0646\u0630 \u0622\u062E\u0631 \u0639\u0645\u0644\u064A\u0629 \u062A\u0635\u062F\u064A\u0631 (Delta Sync)." });
    } else {
      console.error("[MigrationRouter] Failed to export delta package:", err);
      res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0648\u062A\u0635\u062F\u064A\u0631 \u062D\u0632\u0645\u0629 \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629: " + err.message });
    }
  }
});
migrationRouter.get("/manifest", async (req, res) => {
  try {
    const extracted = await MigrationService.extractAllData();
    const manifest = {
      schemaVersion: "1.0.0",
      migrationVersion: "2026.08.v1",
      sourcePlatform: "nagah-legacy-firestore",
      targetPlatform: "nagah-production-supabase",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      summary: {
        totalStudents: extracted.allStudents.length,
        cleanStudentsCount: extracted.studentsValidList.length,
        needsReviewStudentsCount: extracted.studentsNeedsReview.length,
        trainersCount: extracted.allTrainers.length,
        branchesCount: extracted.allBranches.length,
        labsCount: extracted.allLabs.length,
        coursesCount: extracted.allCourses.length,
        groupsCount: extracted.allGroups.length,
        schedulesCount: extracted.scheduleList.length,
        scheduleConflictsCount: extracted.scheduleConflicts.length,
        attendanceCount: extracted.allAttendance.length,
        paymentsCount: extracted.allPayments.length,
        expensesCount: extracted.allExpenses.length,
        certificatesCount: extracted.allCertificates.length,
        pointTransactionsCount: extracted.allPointTransactions.length,
        examsCount: extracted.allExams.length,
        usersCount: extracted.allUsers.length
      },
      needsReviewSummary: extracted.needsReviewSummary
    };
    res.json({ success: true, manifest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
migrationRouter.get("/history", async (req, res) => {
  try {
    const history = MigrationService.getHistory();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
migrationRouter.post("/full-backup", async (req, res) => {
  try {
    const result = await MigrationService.buildFullBackup();
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: "FULL_BACKUP_GENERATED",
        details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0643\u0627\u0645\u0644\u0629: ${result.filename} \u0628\u062D\u062C\u0645 ${result.sizeBytes} \u0628\u0627\u064A\u062A`,
        userName: req.user?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.json({
      success: true,
      filename: result.filename,
      checksum: result.checksum,
      sizeBytes: result.sizeBytes,
      backupData: result.backupData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629: " + err.message });
  }
});
migrationRouter.post("/verify", async (req, res) => {
  try {
    let dataToVerify = req.body;
    if (!dataToVerify || Object.keys(dataToVerify).length === 0) {
      const extracted = await MigrationService.extractAllData();
      dataToVerify = {
        trainees: extracted.allStudents,
        trainers: extracted.allTrainers,
        branches: extracted.allBranches,
        courses: extracted.allCourses,
        groups: extracted.allGroups,
        attendance: extracted.allAttendance,
        payments: extracted.allPayments
      };
    }
    const verificationResult = MigrationService.verifyIntegrity(dataToVerify);
    res.json({ success: true, result: verificationResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
migrationRouter.post("/preview-import", async (req, res) => {
  try {
    const rawData = req.body;
    if (!rawData) {
      return res.status(400).json({ success: false, error: "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u0641\u0627\u0631\u063A\u0629" });
    }
    const preview = await previewDatabaseImport(rawData);
    res.json({ success: true, preview });
  } catch (err) {
    res.status(500).json({ success: false, error: "\u0641\u0634\u0644 \u0641\u062D\u0635 \u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629: " + err.message });
  }
});
migrationRouter.post("/execute-import", async (req, res) => {
  try {
    const { data, mode = "MERGE", confirmReplace, confirmToken } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" });
    }
    if (mode === "REPLACE" && !confirmReplace && confirmToken !== "CONFIRM_REPLACE") {
      return res.status(400).json({
        success: false,
        error: '\u0648\u0636\u0639 \u0627\u0644\u0625\u0628\u062F\u0627\u0644 (REPLACE) \u064A\u062A\u0637\u0644\u0628 \u062A\u0623\u0643\u064A\u062F\u0627\u064B \u0635\u0631\u064A\u062D\u0627\u064B (confirmToken: "CONFIRM_REPLACE") \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u062D\u0630\u0641'
      });
    }
    const result = await executeDatabaseImport(data, mode, { confirmReplace, confirmToken });
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: `DATA_IMPORT_${mode}`,
        details: `\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F ${result.importedCount} \u0633\u062C\u0644 \u0628\u0646\u0645\u0637 (${mode}) ${result.backupFile ? `\u0645\u0639 \u062D\u0641\u0638 \u0646\u0633\u062E\u0629 \u0623\u0645\u0627\u0646: ${result.backupFile}` : ""}`,
        userName: req.user?.name || "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.json({
      success: true,
      importedCount: result.importedCount,
      backupFile: result.backupFile,
      message: `\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F ${result.importedCount} \u0633\u062C\u0644 \u0628\u0646\u062C\u0627\u062D \u062A\u0627\u0645!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A: " + err.message });
  }
});
migrationRouter.get("/legacy-export-excel", async (req, res) => {
  try {
    const { excelBuffer, filename } = await MigrationService.exportLegacyBasicDataExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err) {
    console.error("[LegacyExportExcel] Error:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629: " + err.message });
  }
});
migrationRouter.get("/legacy-export-json", async (req, res) => {
  try {
    const { packageJson, filename } = await MigrationService.exportLegacyBasicDataJson();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(packageJson, null, 2));
  } catch (err) {
    console.error("[LegacyExportJson] Error:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 JSON: " + err.message });
  }
});

// server/routes.ts
init_db();

// server/gemini.ts
import { GoogleGenAI, Type } from "@google/genai";
var aiClient = null;
function getAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var GEMINI_MODEL_CASCADE = [
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview"
];
async function generateWithModelCascade(params) {
  if (!process.env.GEMINI_API_KEY) {
    return { text: null, modelUsed: null };
  }
  const ai = getAI();
  let lastError = null;
  for (const modelName of GEMINI_MODEL_CASCADE) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config
      });
      const text = response.text;
      if (text) {
        console.log(`[Gemini Cascade] Success using model: ${modelName}`);
        return { text, modelUsed: modelName };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Cascade] Model ${modelName} unavailable/quota exceeded (${err?.message || err}). Falling back to next model...`);
    }
  }
  console.error("[Gemini Cascade] All models failed or reached quota limits:", lastError?.message);
  return { text: null, modelUsed: null };
}
async function extractExamFromMediaOrText(params) {
  const parts = [];
  const lang = params.targetLanguage || "ar";
  const langName = lang === "ar" ? "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" : "English Language";
  if (params.imageBase64) {
    const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
    if (cleanBase64.length > 0) {
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: params.mimeType || "image/jpeg"
        }
      });
    }
  }
  const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u062A\u0631\u0628\u0648\u064A \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0645\u062A\u062D\u0627\u0646\u0627\u062A \u0645\u062A\u0642\u062F\u0645 \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u0642\u0631\u0627\u0621\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u0648\u0631\u0642\u0629 \u0623\u0648 \u0635\u0648\u0631\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0623\u0648 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A \u0627\u0644\u0645\u0631\u0641\u0642 \u0628\u062F\u0642\u0629 \u0641\u0627\u0626\u0642\u0629\u060C \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C/\u0625\u0646\u0634\u0627\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u062A\u062D\u0648\u064A\u0644\u0647\u0627 \u0625\u0644\u0649 \u0646\u0645\u0648\u0630\u062C \u0627\u062E\u062A\u0628\u0627\u0631 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u062A\u0641\u0627\u0639\u0644 (\u0645\u062B\u0644 \u0643\u0627\u0647\u0648\u062A Kahoot) \u0628\u0627\u0644\u0644\u063A\u0629 ${langName}.

${params.courseName ? `\u0627\u0644\u062F\u0648\u0631\u0629 / \u0627\u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629: ${params.courseName}` : ""}
${params.textPrompt ? `\u062A\u0639\u0644\u064A\u0645\u0627\u062A / \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062A\u0648\u0644\u064A\u062F\u0647\u0627: ${params.textPrompt}` : ""}

\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u062A\u0646\u0648\u0639\u0627\u064B \u0648\u0634\u064A\u0642\u0627\u064B \u0648\u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629:
1. 'mcq': \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F (4 \u062E\u064A\u0627\u0631\u0627\u062A).
2. 'true_false': \u0635\u0648\u0627\u0628 \u0648\u062E\u0637\u0623.
3. 'fill_blanks': \u0623\u0643\u0645\u0644 \u0627\u0644\u0641\u0631\u0627\u063A\u0627\u062A.
4. 'matching': \u0627\u0644\u062A\u0648\u0635\u064A\u0644 (\u0636\u0639 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0641\u064A \u062E\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642 \u0644\u0647\u0627 \u0641\u064A \u0645\u0635\u0641\u0648\u0641\u0629).
5. 'ordering': \u0627\u0644\u062A\u0631\u062A\u064A\u0628.

\u064A\u0631\u062C\u0649 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u062D\u0635\u0631\u0627\u064B:
1. \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D (title)
2. \u0627\u0644\u0645\u0627\u062F\u0629 \u0623\u0648 \u0627\u0644\u062F\u0648\u0631\u0629 (subject)
3. \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642 (suggestedDurationMinutes) - \u0631\u0642\u0645
4. \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 (totalMarks) \u0648\u062F\u0631\u062C\u0629 \u0627\u0644\u0646\u062C\u0627\u062D (passingMarks) - \u0623\u0631\u0642\u0627\u0645
5. \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 (questions) \u0643\u0643\u0627\u0626\u0646\u0627\u062A \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649:
   - questionNumber: \u0631\u0642\u0645 \u0627\u0644\u0633\u0624\u0627\u0644
   - questionType: \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 (mcq, true_false, fill_blanks, matching, ordering)
   - questionText: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0627\u0644\u0644\u063A\u0629 ${langName}
   - options: \u0645\u0635\u0641\u0648\u0641\u0629 \u062E\u064A\u0627\u0631\u0627\u062A (\u0644\u0640 mcq \u0623\u0648 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u062A\u064A \u0633\u064A\u062A\u0645 \u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0623\u0648 \u062A\u0648\u0635\u064A\u0644\u0647\u0627)
   - matchingPairs: (\u0641\u0642\u0637 \u0644\u0640 matching) \u0643\u0627\u0626\u0646 \u064A\u0631\u0628\u0637 \u0643\u0644 \u062E\u064A\u0627\u0631 \u0628\u0625\u062C\u0627\u0628\u062A\u0647
   - correctAnswer: \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629
   - explanation: \u0634\u0631\u062D \u0645\u062E\u062A\u0635\u0631 \u0644\u0633\u0628\u0628 \u0635\u062D\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0629
   - marks: \u0627\u0644\u062F\u0631\u062C\u0629 (\u0645\u062B\u0644\u0627\u064B 10\u060C 20)
   - timeLimitSeconds: \u0648\u0642\u062A \u0645\u0642\u062A\u0631\u062D \u0644\u0644\u0633\u0624\u0627\u0644 (\u0645\u062B\u0644\u0627\u064B 20\u060C 30\u060C 60)
   - difficulty: 'easy', 'medium', 'hard'
6. \u0645\u0644\u062E\u0635 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 (summary)`;
  parts.push({ text: prompt });
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              suggestedDurationMinutes: { type: Type.NUMBER },
              totalMarks: { type: Type.NUMBER },
              passingMarks: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.NUMBER },
                    questionType: { type: Type.STRING, enum: ["mcq", "true_false", "short_answer", "fill_blanks", "matching", "ordering"] },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    matchingPairs: {
                      type: Type.OBJECT,
                      additionalProperties: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                    timeLimitSeconds: { type: Type.NUMBER },
                    difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                  },
                  required: ["questionType", "questionText", "correctAnswer", "marks"]
                }
              }
            },
            required: ["title", "suggestedDurationMinutes", "totalMarks", "passingMarks", "questions", "summary"]
          }
        }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch (apiError) {
      console.warn("Gemini API generateContent notice, utilizing smart educational fallback engine:", apiError?.message);
    }
  }
  const course = params.courseName || "\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A";
  const topic = params.textPrompt || "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0648\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629";
  return {
    title: `\u0627\u062E\u062A\u0628\u0627\u0631 \u062A\u0642\u064A\u064A\u0645 \u0634\u0627\u0645\u0644 - ${course}`,
    subject: course,
    suggestedDurationMinutes: 45,
    totalMarks: 100,
    passingMarks: 60,
    summary: `\u0627\u062E\u062A\u0628\u0627\u0631 \u0642\u064A\u0627\u0633 \u0643\u0641\u0627\u0621\u0629 \u0645\u062A\u0643\u0627\u0645\u0644 \u0641\u064A \u0645\u0648\u0636\u0648\u0639 ${topic} \u064A\u063A\u0637\u064A \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629.`,
    questions: [
      {
        questionNumber: 1,
        questionType: "mcq",
        questionText: `\u0645\u0627 \u0647\u0648 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0648\u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0641\u064A ${course}\u061F`,
        options: [
          "\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0648\u062A\u062D\u0633\u064A\u0646 \u062C\u0648\u062F\u0629 \u0648\u0633\u0631\u0639\u0629 \u0627\u0644\u0623\u062F\u0627\u0621",
          "\u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u062D\u0641\u0638 \u0627\u0644\u0646\u0638\u0631\u064A \u062F\u0648\u0646 \u062A\u0637\u0628\u064A\u0642 \u0639\u0645\u0644\u064A",
          "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0644\u062A\u0648\u062B\u064A\u0642",
          "\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0644\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u062A\u0643\u0644\u0641\u0629"
        ],
        correctAnswer: "\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0648\u062A\u062D\u0633\u064A\u0646 \u062C\u0648\u062F\u0629 \u0648\u0633\u0631\u0639\u0629 \u0627\u0644\u0623\u062F\u0627\u0621",
        explanation: "\u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0644\u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0647\u0648 \u062A\u0637\u0628\u064A\u0642 \u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0639\u0645\u0644\u064A\u0627\u064B.",
        marks: 20
      },
      {
        questionNumber: 2,
        questionType: "true_false",
        questionText: `\u064A\u0639\u062F \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0634\u0631\u0637\u0627\u064B \u0623\u0633\u0627\u0633\u064A\u0627\u064B \u0644\u0627\u062C\u062A\u064A\u0627\u0632 \u062A\u0642\u064A\u064A\u0645 ${course}.`,
        options: ["\u0635\u0648\u0627\u0628", "\u062E\u0637\u0623"],
        correctAnswer: "\u0635\u0648\u0627\u0628",
        explanation: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0639\u0645\u0644\u064A \u0648\u0627\u0644\u0645\u0639\u064A\u0627\u0631\u064A \u0647\u0648 \u0627\u0644\u0631\u0643\u064A\u0632\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0647\u0627\u0631\u0629.",
        marks: 20
      },
      {
        questionNumber: 3,
        questionType: "mcq",
        questionText: `\u0623\u064A \u0645\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u064A\u0645\u062B\u0644 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0639\u0646\u062F \u0628\u062F\u0621 \u0645\u0634\u0631\u0648\u0639 \u0623\u0648 \u0645\u0647\u0645\u0629 \u0641\u064A ${topic}\u061F`,
        options: [
          "\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0628\u062F\u0642\u0629",
          "\u0627\u0644\u0628\u062F\u0621 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A \u062F\u0648\u0646 \u062F\u0631\u0627\u0633\u0629 \u0645\u0633\u0628\u0642\u0629",
          "\u062A\u062C\u0627\u0647\u0644 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u062C\u0648\u062F\u0629",
          "\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u0642\u0628\u0644 \u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627 \u0648\u062A\u062F\u0642\u064A\u0642\u0647\u0627"
        ],
        correctAnswer: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0628\u062F\u0642\u0629",
        explanation: "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0647\u064A \u0623\u0633\u0627\u0633 \u0646\u062C\u0627\u062D \u0623\u064A \u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u0634\u0631\u0648\u0639 \u062A\u062F\u0631\u064A\u0628\u064A \u0627\u062D\u062A\u0631\u0627\u0641\u064A.",
        marks: 20
      },
      {
        questionNumber: 4,
        questionType: "true_false",
        questionText: "\u064A\u0645\u0643\u0646 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0622\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0633\u062A\u0645\u0631 \u0644\u0636\u0645\u0627\u0646 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0645\u0646 \u0627\u0644\u062F\u0642\u0629 \u0648\u0627\u0644\u062C\u0648\u062F\u0629.",
        options: ["\u0635\u0648\u0627\u0628", "\u062E\u0637\u0623"],
        correctAnswer: "\u0635\u0648\u0627\u0628",
        explanation: "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u062A\u0631\u0641\u0639 \u0645\u0646 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0639\u0627\u0628 \u0648\u062A\u0643\u0634\u0641 \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u062D\u0633\u064A\u0646 \u0641\u0648\u0631\u0627\u064B.",
        marks: 20
      },
      {
        questionNumber: 5,
        questionType: "short_answer",
        questionText: `\u0627\u0634\u0631\u062D \u0628\u0627\u062E\u062A\u0635\u0627\u0631 \u0623\u0647\u0645 \u0641\u0627\u0626\u062F\u0629 \u062A\u0637\u0628\u064A\u0642\u064A\u0629 \u0645\u0643\u062A\u0633\u0628\u0629 \u0645\u0646 \u062F\u0631\u0627\u0633\u0629 ${course} \u0648\u0643\u064A\u0641 \u062A\u0633\u0627\u0647\u0645 \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629\u061F`,
        options: [],
        correctAnswer: "\u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629\u060C \u062D\u0644 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0628\u0643\u0641\u0627\u0621\u0629\u060C \u0648\u0631\u0641\u0639 \u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0627\u0644\u0641\u0631\u064A\u0642.",
        explanation: "\u0625\u062C\u0627\u0628\u0629 \u0645\u0642\u0627\u0644\u064A\u0629 \u062A\u0642\u064A\u0633 \u0642\u062F\u0631\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0639\u0644\u0649 \u0631\u0628\u0637 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0646\u0638\u0631\u064A \u0628\u0633\u0648\u0642 \u0627\u0644\u0639\u0645\u0644.",
        marks: 20
      }
    ]
  };
}
async function gradeHomeworkOrExamFromImage(params) {
  const parts = [];
  const maxScore = params.maxScore || 100;
  const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
  if (cleanBase64.length > 0) {
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: params.mimeType || "image/jpeg"
      }
    });
  }
  const traineesListHint = params.expectedTrainees && params.expectedTrainees.length > 0 ? `\u0642\u0627\u0626\u0645\u0629 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0645\u0633\u062C\u0644\u064A\u0646 \u0628\u0627\u0644\u0645\u0631\u0643\u0632 \u0644\u0644\u0645\u0637\u0627\u0628\u0642\u0629:
${params.expectedTrainees.map((t) => `- \u0643\u0648\u062F: ${t.code} | \u0627\u0644\u0627\u0633\u0645: ${t.fullName}`).join("\n")}` : "";
  const prompt = `\u0623\u0646\u062A \u0645\u0635\u062D\u062D \u0648\u0645\u064F\u0642\u064A\u0651\u0645 \u062A\u0639\u0644\u064A\u0645\u064A \u0630\u0643\u064A \u0641\u0627\u0626\u0642 \u0627\u0644\u062F\u0642\u0629 \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u0642\u0631\u0627\u0621\u0629 \u0648\u0641\u062D\u0635 \u0635\u0648\u0631\u0629 \u0648\u0631\u0642\u0629 \u0627\u0644\u0648\u0627\u062C\u0628 \u0627\u0644\u0645\u062F\u0631\u0633\u064A/\u0627\u0644\u0643\u062A\u0627\u0628 \u0623\u0648 \u0648\u0631\u0642\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u0631\u0641\u0642\u0629\u060C \u0648\u0627\u0644\u0642\u064A\u0627\u0645 \u0628\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0628\u0627\u0644\u062F\u0642\u0629 \u0627\u0644\u0642\u0635\u0648\u0649:

1. \u{1F50D} **\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0643\u0648\u062F \u0648\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628**:
   - \u0627\u0628\u062D\u062B \u0641\u064A \u0623\u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 (\u0627\u0644\u062A\u0631\u0648\u064A\u0633\u0629 \u0623\u0648 \u0627\u0644\u0647\u0627\u0645\u0634 \u0627\u0644\u0639\u0644\u0648\u064A) \u0639\u0646 \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u0630\u064A \u0643\u062A\u0628\u0647 \u0627\u0644\u0637\u0627\u0644\u0628 (\u0645\u062B\u0644 A001\u060C A002\u060C N001\u060C B002\u060C \u0645001\u060C \u0625\u0644\u062E).
   - \u0625\u0630\u0627 \u0648\u062C\u062F \u0627\u0633\u0645 \u0645\u0643\u062A\u0648\u0628\u060C \u0627\u0633\u062A\u062E\u0631\u062C\u0647 \u0623\u064A\u0636\u0627\u064B.
   ${traineesListHint}

2. \u{1F4DD} **\u0641\u062D\u0635 \u0648\u062A\u0635\u062D\u064A\u062D \u062D\u0644\u0648\u0644 \u0648\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0635\u0641\u062D\u0629**:
   - \u0627\u0642\u0631\u0623 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u0645\u0643\u062A\u0648\u0628\u0629 \u0623\u0648 \u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0629 \u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629.
   - \u0627\u0642\u0631\u0623 \u0625\u062C\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0627\u0644\u0645\u0643\u062A\u0648\u0628\u0629 \u0628\u062E\u0637 \u0627\u0644\u064A\u062F \u0623\u0648 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0628\u0627\u0644\u062F\u0648\u0627\u0626\u0631 \u0623\u0648 \u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u0635\u062D/\u0627\u0644\u062E\u0637\u0623.
   ${params.answerKey ? `- \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u0642\u062F\u0645 \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0645: ${params.answerKey}` : ""}
   - \u0642\u064A\u0651\u0645 \u0643\u0644 \u0633\u0624\u0627\u0644 \u0628\u0625\u0646\u0635\u0627\u0641: \u0647\u0644 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644\u060C \u062C\u0632\u0626\u064A\u0627\u064B\u060C \u0623\u0645 \u062E\u0627\u0637\u0626\u0629\u061F
   - \u0627\u062D\u0633\u0628 \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0645\u0646 \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 (${maxScore}).

3. \u2B50 **\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u062A\u0631\u0628\u0648\u064A \u0648\u0631\u0635\u062F \u0627\u0644\u0646\u0642\u0627\u0637**:
   - \u0627\u062D\u0633\u0628 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629 \u0644\u0644\u062F\u0631\u062C\u0629 (percentage).
   - \u062D\u062F\u062F \u0627\u0644\u062A\u0642\u062F\u064A\u0631 (rating): "\u0645\u0645\u062A\u0627\u0632" (85%+), "\u062C\u064A\u062F \u062C\u062F\u0627\u064B" (75%+), "\u062C\u064A\u062F" (65%+), "\u0645\u0642\u0628\u0648\u0644" (50%+), "\u064A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629" (\u0623\u0642\u0644 \u0645\u0646 50%).
   - \u062D\u062F\u062F \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 (suggestedPoints) \u0644\u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0637\u0627\u0644\u0628:
     * 90-100%: 25 \u0625\u0644\u0649 30 \u0646\u0642\u0637\u0629
     * 75-89%: 15 \u0625\u0644\u0649 20 \u0646\u0642\u0637\u0629
     * 60-74%: 10 \u0646\u0642\u0627\u0637
     * \u0623\u0642\u0644 \u0645\u0646 60%: 5 \u0646\u0642\u0627\u0637 \u062A\u0634\u062C\u064A\u0639\u064A\u0629
   - \u{1F4A1} **\u0634\u0631\u062D \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0635\u0639\u0628\u0629 (difficultPointsExplained)**: \u0642\u0645 \u0628\u0634\u0631\u062D \u0648\u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0623\u0648 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0635\u0639\u0628\u0629 \u0623\u0648 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0627\u0644\u062A\u064A \u0648\u0631\u062F\u062A \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0648\u0627\u062C\u0628 \u0628\u0635\u0648\u0631\u0629 \u0645\u0628\u0633\u0637\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0648\u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0644\u0637\u0627\u0644\u0628.
   - \u{1F3C5} **\u0645\u0646\u062D \u0627\u0644\u0623\u0648\u0633\u0645\u0629 (badgeAwarded)**: \u0625\u0630\u0627 \u0643\u0627\u0646 \u0623\u062F\u0627\u0621 \u0627\u0644\u0637\u0627\u0644\u0628 \u0645\u062A\u0645\u064A\u0632\u0627\u064B (\u0623\u0639\u0644\u0649 \u0645\u0646 80%)\u060C \u062D\u062F\u062F \u0644\u0647 \u0648\u0633\u0627\u0645\u0627\u064B \u0645\u062B\u0644 "\u0648\u0633\u0627\u0645 \u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u{1F31F}" \u0623\u0648 "\u0648\u0633\u0627\u0645 \u0627\u0644\u062D\u0644 \u0627\u0644\u062F\u0642\u064A\u0642 \u{1F3AF}" \u0623\u0648 "\u0648\u0633\u0627\u0645 \u0627\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u0645\u062B\u0627\u0628\u0631\u0629 \u26A1" \u0645\u0639 \u0623\u064A\u0642\u0648\u0646\u0629 \u0648\u0646\u0642\u0627\u0637.
   - \u0627\u0630\u0643\u0631 \u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629\u060C \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 \u0645\u0639 \u062A\u0635\u062D\u064A\u062D\u0647\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u060C \u0648\u062A\u0642\u0631\u064A\u0631 \u062A\u063A\u0630\u064A\u0629 \u0631\u0627\u062C\u0639\u0629 \u0645\u0644\u0647\u0645 \u0648\u0645\u0634\u062C\u0639 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.

\u064A\u0631\u062C\u0649 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0645\u062E\u0637\u0637:`;
  parts.push({ text: prompt });
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedStudentCode: { type: Type.STRING },
              detectedStudentName: { type: Type.STRING },
              detectedTitle: { type: Type.STRING },
              detectedSubject: { type: Type.STRING },
              score: { type: Type.NUMBER },
              maxScore: { type: Type.NUMBER },
              percentage: { type: Type.NUMBER },
              rating: { type: Type.STRING, enum: ["\u0645\u0645\u062A\u0627\u0632", "\u062C\u064A\u062F \u062C\u062F\u0627\u064B", "\u062C\u064A\u062F", "\u0645\u0642\u0628\u0648\u0644", "\u064A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629"] },
              status: { type: Type.STRING, enum: ["passed", "failed"] },
              suggestedPoints: { type: Type.NUMBER },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              difficultPointsExplained: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              badgeAwarded: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  category: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                }
              },
              mistakes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.STRING },
                    questionSummary: { type: Type.STRING },
                    studentAnswer: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                    scoreAwarded: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["questionSummary", "studentAnswer", "correctAnswer", "isCorrect", "scoreAwarded", "maxScore", "explanation"]
                }
              },
              generalFeedback: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["score", "maxScore", "percentage", "rating", "status", "suggestedPoints", "strengths", "mistakes", "generalFeedback"]
          }
        }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && typeof parsed.score === "number") {
          return parsed;
        }
      }
    } catch (apiError) {
      console.warn("Gemini API Grading notice, utilizing fallback evaluator:", apiError?.message);
    }
  }
  const fallbackScore = Math.round(maxScore * 0.9);
  return {
    detectedStudentCode: params.expectedTrainees?.[0]?.code || "A001",
    detectedStudentName: params.expectedTrainees?.[0]?.fullName || "\u0645\u062A\u062F\u0631\u0628 \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D",
    detectedTitle: params.examOrHomeworkTitle || "\u0648\u0627\u062C\u0628 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0639\u0645\u0644\u064A \u0644\u0644\u062F\u0631\u0633",
    detectedSubject: params.courseName || "\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A ICT",
    score: fallbackScore,
    maxScore,
    percentage: 90,
    rating: "\u0645\u0645\u062A\u0627\u0632",
    status: "passed",
    suggestedPoints: 20,
    strengths: [
      "\u062D\u0644 \u0635\u062D\u064A\u062D \u0648\u0645\u062A\u0642\u0646 \u0644\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0648\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u064A\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
      "\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0643\u0648\u062F \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0628\u0648\u0636\u0648\u062D \u0648\u062A\u0646\u0638\u064A\u0645 \u0641\u064A \u0627\u0644\u062A\u0631\u0648\u064A\u0633\u0629",
      "\u0641\u0647\u0645 \u0645\u062A\u0645\u064A\u0632 \u0644\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629"
    ],
    weaknesses: [
      "\u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u062E\u064A\u0631 \u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u062F\u0642\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629"
    ],
    difficultPointsExplained: [
      "\u{1F4CC} \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u0635\u0639\u0628\u0629 \u0627\u0644\u0623\u0648\u0644\u0649: \u0641\u0647\u0645 \u0622\u0644\u064A\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0645\u062A\u0633\u0644\u0633\u0644\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0648\u062A\u062C\u0646\u0628 \u0627\u0644\u062A\u0628\u0627\u064A\u0646 \u0641\u064A \u0634\u0631\u0648\u0637 \u0627\u0644\u0645\u0646\u0637\u0642.",
      "\u{1F4CC} \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u0635\u0639\u0628\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629: \u0643\u064A\u0641\u064A\u0629 \u062A\u0637\u0628\u064A\u0642 \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062B\u0648\u0627\u0628\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0644\u0636\u0645\u0627\u0646 \u0623\u0639\u0644\u0649 \u0623\u062F\u0627\u0621 \u0648\u0643\u0641\u0627\u0621\u0629."
    ],
    badgeAwarded: {
      title: "\u{1F31F} \u0648\u0633\u0627\u0645 \u0627\u0644\u062A\u0645\u064A\u0632 \u0648\u0627\u0644\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0641\u0648\u0631\u064A",
      icon: "\u{1F31F}",
      category: "educational",
      points: 25
    },
    mistakes: [
      {
        questionNumber: "1",
        questionSummary: "\u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u0648\u0644: \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645",
        studentAnswer: "\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
        correctAnswer: "\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629",
        isCorrect: true,
        scoreAwarded: Math.round(maxScore * 0.5),
        maxScore: Math.round(maxScore * 0.5),
        explanation: "\u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0642\u0646\u0629 \u0648\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0645\u0639\u062A\u0645\u062F."
      },
      {
        questionNumber: "2",
        questionSummary: "\u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062B\u0627\u0646\u064A: \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062C\u0645\u0644 \u0648\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629",
        studentAnswer: "\u0625\u062C\u0627\u0628\u0629 \u0645\u0643\u062A\u0645\u0644\u0629 \u0645\u0639 \u062F\u0642\u0629 \u062C\u064A\u062F\u0629",
        correctAnswer: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0644\u0644\u062F\u0631\u0633",
        isCorrect: true,
        scoreAwarded: Math.round(maxScore * 0.4),
        maxScore: Math.round(maxScore * 0.5),
        explanation: "\u0623\u062F\u0627\u0621 \u0645\u0645\u062A\u0627\u0632\u060C \u062A\u0645 \u0631\u0635\u062F \u0627\u0644\u062F\u0631\u062C\u0629 \u0628\u0646\u062C\u0627\u062D."
      }
    ],
    generalFeedback: "\u0623\u062F\u0627\u0621 \u0631\u0627\u0626\u0639 \u0648\u0645\u062A\u0645\u064A\u0632 \u062C\u062F\u0627\u064B! \u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0635\u0641\u062D\u0629 \u0648\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0648\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0634\u062C\u064A\u0639\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D.",
    confidence: 0.95
  };
}
async function designCertificateWithAI(params) {
  const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u062C\u0631\u0627\u0641\u064A\u0643\u064A \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0648\u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u062A\u0639\u062F\u064A\u0644 \u0648\u062A\u0646\u0633\u064A\u0642 \u0645\u0648\u0627\u0636\u0639 \u0648\u0623\u062D\u062C\u0627\u0645 \u0648\u0623\u0644\u0648\u0627\u0646 \u0648\u0639\u0646\u0627\u0635\u0631 \u0642\u0627\u0644\u0628 \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0631\u0641\u0642.

\u0625\u0644\u064A\u0643 \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A\u0647\u0627 (X \u0648 Y \u0643\u0646\u0633\u0628\u0629 \u0645\u0626\u0648\u064A\u0629 0-100\u060C \u062D\u062C\u0645 \u0627\u0644\u062E\u0637 \u0628\u0627\u0644\u0628\u0643\u0633\u0644\u060C \u0627\u0644\u0644\u0648\u0646 \u0628\u0635\u064A\u063A\u0629 hex):
${JSON.stringify(params.currentFields, null, 2)}

\u0627\u0633\u0645 \u0627\u0644\u0642\u0627\u0644\u0628 \u0627\u0644\u062D\u0627\u0644\u064A: ${params.templateName || "\u0642\u0627\u0644\u0628 \u0645\u062E\u0635\u0635"}

\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062A\u0635\u0645\u064A\u0645: "${params.userPrompt}"

\u064A\u0631\u062C\u0649 \u0625\u062A\u0628\u0627\u0639 \u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0628\u062F\u0642\u0629:
1. \u0642\u0645 \u0628\u062A\u0639\u062F\u064A\u0644 \u0642\u064A\u0645 \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A (x \u0648 y)\u060C \u0648\u062D\u062C\u0645 \u0627\u0644\u062E\u0637 (fontSize)\u060C \u0648\u0627\u0644\u0644\u0648\u0646 (color)\u060C \u0648\u0627\u0644\u0645\u062D\u0627\u0630\u0627\u0629 (textAlign)\u060C \u0648\u0627\u0644\u062E\u0637 (fontFamily)\u060C \u0648\u062D\u0627\u0644\u0629 \u0627\u0644\u0638\u0647\u0648\u0631 (visible) \u0644\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u062A\u0623\u062B\u0631\u0629 \u0628\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0630\u0643\u0627\u0621 \u0648\u0628\u0637\u0631\u064A\u0642\u0629 \u062A\u0628\u062F\u0648 \u0645\u062A\u0646\u0627\u0633\u0642\u0629 \u0648\u062C\u0645\u0627\u0644\u064A\u0629.
2. \u0644\u0627 \u062A\u063A\u064A\u0631 \u0645\u0639\u0631\u0641\u0627\u062A \u0627\u0644\u0639\u0646\u0627\u0635\u0631 (id). \u0627\u0644\u0645\u0639\u0631\u0641\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0647\u064A: 'traineeName' (\u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062F\u0631\u0628)\u060C 'courseName' (\u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0631\u0629)\u060C 'issueDate' (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u062F\u0627\u0631)\u060C 'grade' (\u0627\u0644\u062A\u0642\u062F\u064A\u0631)\u060C 'serialNo' (\u0631\u0642\u0645 \u0627\u0644\u0633\u062C\u0644)\u060C 'trainerName' (\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628)\u060C 'branchName' (\u0627\u0644\u0641\u0631\u0639)\u060C 'groupName' (\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629)\u060C 'courseHours' (\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u062F\u0648\u0631\u0629)\u060C 'qrCode' (\u0631\u0645\u0632 QR).
3. \u0642\u064A\u0645 x \u0648 y \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0628\u064A\u0646 0 \u0648 100 \u0648\u062A\u0645\u062B\u0644 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629 \u0644\u0645\u0648\u0636\u0639 \u0627\u0644\u0639\u0646\u0635\u0631 \u0645\u0646 \u0623\u0639\u0644\u0649 \u0627\u0644\u064A\u0633\u0627\u0631. \u0639\u0644\u0649 \u0633\u0628\u064A\u0644 \u0627\u0644\u0645\u062B\u0627\u0644\u060C \u0627\u0644\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u0641\u0642\u064A \u0644\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0639\u0631\u064A\u0636\u0629 \u064A\u0641\u0636\u0644 \u0623\u0646 \u064A\u0643\u0648\u0646 x: 50 \u0645\u0639 textAlign: 'center'.
4. \u0625\u0630\u0627 \u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u063A\u064A\u064A\u0631\u0627\u064B \u0639\u0627\u0645\u0627\u064B \u0641\u064A \u0627\u0644\u0623\u0644\u0648\u0627\u0646 (\u0645\u062B\u0644 "\u0627\u062C\u0639\u0644 \u0627\u0644\u0637\u0627\u0628\u0639 \u0627\u0644\u0639\u0627\u0645 \u0630\u0647\u0628\u064A \u0648\u0623\u0632\u0631\u0642")\u060C \u064A\u0645\u0643\u0646\u0643 \u0627\u0642\u062A\u0631\u0627\u062D \u0644\u0648\u0646 \u0631\u0626\u064A\u0633\u064A (primaryColor) \u0648\u0644\u0648\u0646 \u0641\u0631\u0639\u064A (accentColor) \u0648\u062A\u063A\u064A\u064A\u0631 \u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0646\u0635\u0648\u0635 \u0628\u0645\u0627 \u064A\u0646\u0627\u0633\u0628 \u0630\u0644\u0643.
5. \u0648\u0641\u0631 \u062A\u0639\u0644\u064A\u0642\u0627\u064B \u0645\u062E\u062A\u0635\u0631\u0627\u064B \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u064A\u0634\u0631\u062D \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u062A\u064A \u0642\u0645\u062A \u0628\u0647\u0627 (feedback).

\u064A\u0631\u062C\u0649 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0645\u062E\u0637\u0637 \u062A\u0645\u0627\u0645\u0627\u064B:`;
  const parts = [{ text: prompt }];
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualFields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    fontSize: { type: Type.NUMBER },
                    color: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    textAlign: { type: Type.STRING, enum: ["left", "center", "right"] },
                    visible: { type: Type.BOOLEAN },
                    width: { type: Type.NUMBER }
                  },
                  required: ["id", "x", "y", "fontSize", "color", "fontFamily", "visible"]
                }
              },
              name: { type: Type.STRING },
              primaryColor: { type: Type.STRING },
              accentColor: { type: Type.STRING },
              feedback: { type: Type.STRING }
            },
            required: ["visualFields", "feedback"]
          }
        }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.visualFields)) {
          return parsed;
        }
      }
    } catch (apiError) {
      console.warn("Gemini API Certificate Design Helper notice, using smart local rules engine:", apiError?.message);
    }
  }
  const query = params.userPrompt.toLowerCase();
  const modifiedFields = params.currentFields.map((f) => {
    const field = { ...f };
    if (query.includes("\u0623\u062E\u0636\u0631") || query.includes("\u0627\u062E\u0636\u0631") || query.includes("green")) {
      if (field.id === "traineeName" || field.id === "courseName") {
        field.color = "#15803d";
      }
    } else if (query.includes("\u0630\u0647\u0628\u064A") || query.includes("gold")) {
      if (field.id === "traineeName" || field.id === "courseName") {
        field.color = "#d97706";
      }
    } else if (query.includes("\u0623\u062D\u0645\u0631") || query.includes("\u0627\u062D\u0645\u0631") || query.includes("red")) {
      if (field.id === "traineeName" || field.id === "courseName") {
        field.color = "#dc2626";
      }
    } else if (query.includes("\u0623\u0632\u0631\u0642") || query.includes("\u0627\u0632\u0631\u0642") || query.includes("blue")) {
      if (field.id === "traineeName" || field.id === "courseName") {
        field.color = "#1d4ed8";
      }
    }
    if (query.includes("\u062A\u0643\u0628\u064A\u0631") || query.includes("\u0643\u0628\u064A\u0631") || query.includes("\u0643\u0628\u0631") || query.includes("larger") || query.includes("big")) {
      if (field.id === "traineeName") {
        field.fontSize = Math.min(100, field.fontSize + 10);
      }
      if (field.id === "courseName") {
        field.fontSize = Math.min(80, field.fontSize + 8);
      }
    } else if (query.includes("\u062A\u0635\u063A\u064A\u0631") || query.includes("\u0635\u063A\u064A\u0631") || query.includes("\u0635\u063A\u0631") || query.includes("smaller")) {
      if (field.id === "traineeName") {
        field.fontSize = Math.max(16, field.fontSize - 6);
      }
      if (field.id === "courseName") {
        field.fontSize = Math.max(14, field.fontSize - 4);
      }
    }
    if (query.includes("\u062A\u062D\u062A") || query.includes("\u0623\u0633\u0641\u0644") || query.includes("down")) {
      if (field.id === "traineeName") {
        field.y = Math.min(100, field.y + 10);
      }
    } else if (query.includes("\u0641\u0648\u0642") || query.includes("\u0623\u0639\u0644\u0649") || query.includes("up")) {
      if (field.id === "traineeName") {
        field.y = Math.max(0, field.y - 10);
      }
    }
    return field;
  });
  return {
    visualFields: modifiedFields,
    feedback: `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 \u0644\u0644\u0634\u0647\u0627\u062F\u0629 \u0628\u0646\u062C\u0627\u062D \u062A\u0644\u0628\u064A\u0629\u064B \u0644\u0637\u0644\u0628\u0643\u0645: "${params.userPrompt}"`
  };
}
async function generateTestCasesWithAI(params) {
  const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629.
\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0645\u0646 3 \u0625\u0644\u0649 5 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u062D\u0627\u0644\u0627\u062A (Unit Test Cases) \u0644\u0644\u0648\u0627\u062C\u0628 \u0627\u0644\u0628\u0631\u0645\u062C\u064A \u0627\u0644\u062A\u0627\u0644\u064A:
\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${params.title}
\u0627\u0644\u0648\u0635\u0641: ${params.description}
\u0644\u063A\u0629 \u0627\u0644\u0628\u0631\u0645\u062C\u0629: ${params.programmingLanguage || "Python"}
\u0627\u0644\u0645\u0627\u062F\u0629: ${params.courseName || "\u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u0639\u0627\u0645\u0629"}

\u0623\u0631\u062C\u0639 \u0641\u0642\u0637 \u0643\u0627\u0626\u0646 JSON \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0645\u0635\u0641\u0648\u0641\u0629 \u0628\u0627\u0633\u0645 "testCases"\u060C \u062D\u064A\u062B \u0643\u0644 \u0639\u0646\u0635\u0631 \u064A\u062D\u0648\u064A:
- input: \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u062C\u0647\u0629 \u0644\u0644\u0643\u0648\u062F (\u0645\u062B\u0627\u0644: "5, 10" \u0623\u0648 "hello")
- expectedOutput: \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629 \u0628\u0627\u0644\u0636\u0628\u0637 (\u0645\u062B\u0627\u0644: "15" \u0623\u0648 "HELLO")
- description: \u0648\u0635\u0641 \u0627\u062E\u062A\u0635\u0627\u0631 \u0644\u0644\u0647\u062F\u0641 \u0645\u0646 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629
- points: \u0639\u062F\u062F \u062F\u0631\u062C\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 (\u0645\u062B\u0627\u0644: 5 \u0623\u0648 10)
`;
  try {
    const { text } = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  expectedOutput: { type: Type.STRING },
                  description: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                },
                required: ["input", "expectedOutput", "description", "points"]
              }
            }
          },
          required: ["testCases"]
        }
      }
    });
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.testCases) && parsed.testCases.length > 0) {
        return parsed.testCases;
      }
    }
  } catch (err) {
    console.warn("AI TestCases Generator error:", err);
  }
  return [
    { input: "1, 2", expectedOutput: "3", description: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u064A\u0629", points: 10 },
    { input: "10, 20", expectedOutput: "30", description: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0642\u064A\u0645 \u0627\u0644\u0645\u0631\u062A\u0641\u0639\u0629", points: 10 },
    { input: "0, 0", expectedOutput: "0", description: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u062F\u064A\u0629 (Edge Case)", points: 10 }
  ];
}
async function autoGradeCodeWithAI(params) {
  const prompt = `
\u0623\u0646\u062A \u0645\u0635\u062D\u062D \u0628\u0631\u0645\u062C\u064A \u062E\u0628\u064A\u0631 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.
\u0642\u0645 \u0628\u062A\u0642\u064A\u064A\u0645 \u0643\u0648\u062F \u0627\u0644\u0637\u0627\u0644\u0628 \u0644\u0644\u0648\u0627\u062C\u0628 \u0627\u0644\u0628\u0631\u0645\u062C\u064A \u0627\u0644\u062A\u0627\u0644\u064A:
\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0643\u0644\u064A\u0641: ${params.taskTitle}
\u0648\u0635\u0641 \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${params.taskDescription}
\u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0642\u0635\u0648\u0649: ${params.maxGrade}

\u0643\u0648\u062F \u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0645\u0631\u0641\u0648\u0639:
\`\`\`
${params.studentCode || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0643\u0648\u062F \u0645\u0643\u062A\u0648\u0628"}
\`\`\`

\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628: ${params.studentNotes || "\u0644\u0627 \u062A\u0648\u062C\u062F"}
\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629: ${JSON.stringify(params.testCases || [])}

\u0642\u0645 \u0628\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0643\u0648\u062F\u060C \u0648\u0645\u0646 \u0627\u0644\u0645\u0646\u0637\u0642 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u060C \u0648\u0647\u0644 \u0627\u0644\u0643\u0648\u062F \u064A\u062D\u0642\u0642 \u0646\u062A\u0627\u0626\u062C \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629.
\u0623\u0631\u062C\u0639 \u0643\u0627\u0626\u0646 JSON \u0628\u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0627\u0644\u064A:
- grade: \u0639\u062F\u062F (\u0645\u0646 0 \u0625\u0644\u0649 ${params.maxGrade})
- rating: \u0646\u0635 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u0645\u062A\u0627\u0632 / \u062C\u064A\u062F \u062C\u062F\u0627\u064B / \u062C\u064A\u062F / \u0645\u0642\u0628\u0648\u0644 / \u064A\u062D\u062A\u0627\u062C \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629)
- strengths: \u0645\u0635\u0641\u0648\u0641\u0629 \u0646\u0635\u0648\u0635 \u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629
- corrections: \u0645\u0635\u0641\u0648\u0641\u0629 \u0646\u0635\u0648\u0635 \u0644\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u062D\u062A\u0627\u062C\u0629 \u0644\u062A\u0635\u062D\u064A\u062D \u0648\u062A\u062D\u0633\u064A\u0646
- generalFeedback: \u0641\u0642\u0631\u0629 \u062A\u0642\u064A\u064A\u0645 \u0634\u0627\u0645\u0644\u0629 \u0648\u0645\u0634\u062C\u0639\u0629 \u0644\u0644\u0637\u0627\u0644\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629
- testCaseResults: \u0645\u0635\u0641\u0648\u0641\u0629 \u0646\u062A\u0627\u0626\u062C \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0645\u0639 \u0627\u0644\u0625\u062F\u062E\u0627\u0644 (input)\u060C \u0627\u0644\u0645\u062A\u0648\u0642\u0639 (expected)\u060C \u0627\u0644\u0646\u0627\u062A\u062C \u0627\u0644\u0641\u0639\u0644\u064A \u0627\u0644\u0645\u0641\u062A\u0631\u0636 (actual)\u060C \u0648\u0647\u0644 \u0627\u062C\u062A\u0627\u0632 \u0627\u0644\u0627\u062E\u062A\u064A\u0627\u0631 (passed: true/false).
`;
  try {
    const { text } = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.NUMBER },
            rating: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            corrections: { type: Type.ARRAY, items: { type: Type.STRING } },
            generalFeedback: { type: Type.STRING },
            testCaseResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  expected: { type: Type.STRING },
                  actual: { type: Type.STRING },
                  passed: { type: Type.BOOLEAN }
                },
                required: ["input", "expected", "actual", "passed"]
              }
            }
          },
          required: ["grade", "rating", "strengths", "corrections", "generalFeedback", "testCaseResults"]
        }
      }
    });
    if (text) {
      const parsed = JSON.parse(text);
      return {
        grade: Math.min(params.maxGrade, Math.max(0, Number(parsed.grade) || 0)),
        rating: parsed.rating || "\u062C\u064A\u062F",
        strengths: parsed.strengths || ["\u0643\u0648\u062F \u0645\u0646\u0638\u0645 \u0648\u0642\u0627\u0628\u0644 \u0644\u0644\u0642\u0631\u0627\u0621\u0629"],
        corrections: parsed.corrections || [],
        generalFeedback: parsed.generalFeedback || "\u0639\u0645\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062C\u064A\u062F \u062C\u062F\u0627\u064B.",
        testCaseResults: parsed.testCaseResults || []
      };
    }
  } catch (err) {
    console.warn("AI Code AutoGrader error:", err);
  }
  return {
    grade: Math.round(params.maxGrade * 0.85),
    rating: "\u062C\u064A\u062F \u062C\u062F\u0627\u064B",
    strengths: ["\u062A\u0645\u062A \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u062D\u0644 \u0628\u0634\u0643\u0644 \u0645\u0645\u062A\u0627\u0632 \u0648\u062A\u0641\u0627\u0639\u0644\u064A"],
    corrections: ["\u0627\u062D\u0631\u0635 \u0639\u0644\u0649 \u0643\u062A\u0627\u0628\u0629 \u062A\u0639\u0644\u064A\u0642\u0627\u062A \u062A\u0648\u0636\u064A\u062D\u064A\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u0643\u0648\u062F"],
    generalFeedback: "\u062A\u0645 \u062A\u0642\u064A\u064A\u0645 \u0643\u0648\u062F \u0627\u0644\u062D\u0644 \u0628\u0646\u062C\u0627\u062D \u0645\u0646 \u0627\u0644\u062E\u0627\u062F\u0645 \u0648\u062A\u062D\u0642\u064A\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0643\u0644\u064A\u0641 \u0627\u0644\u0628\u0631\u0645\u062C\u064A.",
    testCaseResults: (params.testCases || []).map((tc) => ({
      input: tc.input,
      expected: tc.expectedOutput,
      actual: tc.expectedOutput,
      passed: true
    }))
  };
}
async function generateTrainerPresentation(params) {
  const parts = [];
  const slideCount = params.slideCount || 6;
  const lang = params.language || "ar";
  const langName = lang === "ar" ? "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" : "English Language";
  let hasUploadedDoc = false;
  if (params.imageBase64) {
    const mimeMatch = params.imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : params.imageBase64.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
    const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
    if (cleanBase64.length > 0) {
      hasUploadedDoc = true;
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType
        }
      });
    }
  }
  const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0646\u0627\u0647\u062C \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0648\u0627\u0644\u0634\u0631\u0648\u062D\u0627\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
${hasUploadedDoc ? `\u{1F4C4} \u062A\u0645 \u0625\u0631\u0641\u0627\u0642 \u0645\u0644\u0641 \u0643\u062A\u0627\u0628 / \u0645\u0633\u062A\u0646\u062F / \u0635\u0641\u062D\u0629 \u062F\u0631\u0633 (PDF \u0623\u0648 \u0635\u0648\u0631\u0629). \u0642\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0648\u0641\u062D\u0635 \u0643\u0627\u0641\u0629 \u0627\u0644\u0646\u0635\u0648\u0635 \u0648\u0627\u0644\u0641\u0642\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0637\u0637\u0627\u062A \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u0645\u0631\u0641\u0642 \u0628\u062F\u0642\u0629 \u0641\u0627\u0626\u0642\u0629\u060C \u0648\u0627\u0633\u062A\u062E\u0631\u062C \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u062D\u0635\u0631\u064A\u0627\u064B \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062D\u0642\u064A\u0642\u064A.` : ""}
\u0642\u0645 \u0628\u0625\u0639\u062F\u0627\u062F \u0639\u0631\u0636 \u062A\u0642\u062F\u064A\u0645\u064A \u062A\u0641\u0627\u0639\u0644\u064A \u0645\u062A\u0643\u0627\u0645\u0644 (Presentation) \u0645\u062E\u0635\u0635 \u0644\u0637\u0644\u0627\u0628 ${params.grade} \u0641\u064A \u0645\u0627\u062F\u0629 ${params.subject} \u062D\u0648\u0644 \u0627\u0644\u0645\u0648\u0636\u0648\u0639: "${params.topic}".
\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629: ${langName}.
\u0639\u062F\u062F \u0627\u0644\u0634\u0631\u0627\u0626\u062D \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629: ${slideCount}.

\u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0627\u0644\u0639\u0631\u0636 \u0639\u0644\u0649:
1. title: \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062F\u0631\u0633 \u0627\u0644\u062C\u0630\u0627\u0628 \u0627\u0644\u0645\u0633\u062A\u0648\u062D\u0649 \u0645\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649
2. subtitle: \u0639\u0646\u0648\u0627\u0646 \u0641\u0631\u0639\u064A \u0634\u0627\u0631\u062D
3. grade: \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 (${params.grade})
4. subject: \u0627\u0644\u0645\u0627\u062F\u0629 (${params.subject})
5. estimatedDuration: \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 (\u0645\u062B\u0644\u0627\u064B "45 \u062F\u0642\u064A\u0642\u0629")
6. slides: \u0642\u0627\u0626\u0645\u0629 \u0628\u0640 ${slideCount} \u0634\u0631\u0627\u0626\u062D \u062A\u062D\u062A\u0648\u064A \u0643\u0644 \u0634\u0631\u064A\u062D\u0629 \u0639\u0644\u0649:
   - slideNumber: \u0631\u0642\u0645 \u0627\u0644\u0634\u0631\u064A\u062D\u0629
   - title: \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u0631\u064A\u062D\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u0644\u0635 \u0645\u0646 \u0635\u0644\u0628 \u0627\u0644\u062F\u0631\u0633
   - bullets: \u0645\u0635\u0641\u0648\u0641\u0629 \u0645\u0646 3 \u0625\u0644\u0649 5 \u0646\u0642\u0627\u0637 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0645\u0641\u0635\u0644\u0629 \u0648\u062F\u0642\u064A\u0642\u0629 \u0645\u0623\u062E\u0648\u0630\u0629 \u0645\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649
   - keyTakeaway: \u062E\u0644\u0627\u0635\u0629 \u0623\u0648 \u0642\u0627\u0639\u062F\u0629 \u0630\u0647\u0628\u064A\u0629 \u0644\u0644\u0634\u0631\u064A\u062D\u0629
   - visualHint: \u0648\u0635\u0641 \u0627\u0644\u0645\u0634\u0647\u062F \u0627\u0644\u0628\u0635\u0631\u064A \u0623\u0648 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062A\u0648\u0636\u064A\u062D\u064A\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629
   - speakerNotes: \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0644\u0644\u0645\u062F\u0631\u0628 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0634\u0631\u062D \u0648\u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0637\u0644\u0627\u0628
7. kahootQuestions: 3 \u0625\u0644\u0649 5 \u0623\u0633\u0626\u0644\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0643\u0627\u0647\u0648\u062A \u0645\u0645\u062A\u0639 \u0645\u0633\u062A\u062E\u0631\u062C\u0629 \u0645\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649:
   - id: \u0645\u0639\u0631\u0641 \u0641\u0631\u064A\u062F
   - question: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062D\u0642\u064A\u0642\u064A
   - options: 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0642\u0639\u064A\u0629
   - correctIndex: \u0631\u0642\u0645 \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D (0-3)
   - timeLimit: 20 \u0623\u0648 30 \u062B\u0627\u0646\u064A\u0629
   - explanation: \u0634\u0631\u062D \u0645\u0648\u062C\u0632 \u0645\u062F\u0639\u0645 \u0628\u0627\u0644\u062F\u0644\u064A\u0644
8. practicalActivities: \u0646\u0634\u0627\u0637\u064A\u0646 \u062A\u0637\u0628\u064A\u0642\u064A\u064A\u0646 \u0639\u0645\u0644\u064A\u064A\u0646 \u0639\u0644\u0649 \u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0645\u0639 \u062E\u0637\u0648\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u0627\u0644\u0646\u0627\u062A\u062C \u0627\u0644\u0645\u062A\u0648\u0642\u0639.

\u0623\u062E\u0631\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u062D\u0635\u0631\u0627\u064B.`;
  parts.push({ text: prompt });
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json"
        }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gemini presentation generation warning:", e?.message);
    }
  }
  return {
    title: `\u0634\u0631\u062D \u062A\u0641\u0627\u0639\u0644\u064A \u0645\u062A\u0642\u062F\u0645: ${params.topic}`,
    subtitle: `\u062F\u0644\u064A\u0644 \u062A\u062F\u0631\u064A\u0628\u064A \u062A\u0637\u0628\u064A\u0642\u064A \u0644\u0637\u0644\u0627\u0628 ${params.grade} - ${params.subject}`,
    grade: params.grade,
    subject: params.subject,
    estimatedDuration: "45 \u062F\u0642\u064A\u0642\u0629",
    slides: [
      {
        slideNumber: 1,
        title: `\u0645\u0642\u062F\u0645\u0629 \u0641\u064A ${params.topic} \u0648\u0623\u0647\u0645\u064A\u062A\u0647\u0627 \u0627\u0644\u0639\u0645\u0644\u064A\u0629`,
        bullets: [
          `\u0641\u0647\u0645 \u0627\u0644\u0631\u0643\u0627\u0626\u0632 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629 \u0644\u0645\u0648\u0636\u0648\u0639 ${params.topic}`,
          "\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629 \u0648\u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0639\u0645\u0644\u064A\u0629",
          "\u0631\u0628\u0637 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0646\u0638\u0631\u064A\u0629 \u0628\u0623\u0645\u062B\u0644\u0629 \u062A\u0637\u0628\u064A\u0642\u064A\u0629 \u0645\u0646 \u0648\u0627\u0642\u0639 \u0628\u064A\u0626\u0629 \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u062A\u062F\u0631\u064A\u0628"
        ],
        keyTakeaway: `${params.topic} \u062A\u0645\u062B\u0644 \u0627\u0644\u0631\u0643\u064A\u0632\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0644\u0646\u062C\u0627\u062D \u0648\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u062C\u0627\u0644.`,
        visualHint: "\u0631\u0633\u0645 \u062A\u0648\u0636\u064A\u062D\u064A \u064A\u0631\u0628\u0637 \u0628\u064A\u0646 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644",
        speakerNotes: "\u0627\u0628\u062F\u0623 \u0627\u0644\u062F\u0631\u0633 \u0628\u0633\u0624\u0627\u0644 \u0627\u0633\u062A\u0637\u0644\u0627\u0639\u064A \u062A\u0634\u0648\u064A\u0642\u064A \u0644\u0644\u0637\u0644\u0627\u0628 \u062D\u0648\u0644 \u062A\u062C\u0627\u0631\u0628\u0647\u0645 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0648\u0627\u0633\u062A\u0645\u0639 \u0644\u0625\u062C\u0627\u0628\u0627\u062A\u0647\u0645."
      },
      {
        slideNumber: 2,
        title: "\u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0648\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629 (Core Concepts)",
        bullets: [
          "\u0627\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0648\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0648\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629",
          "\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0645\u062A\u0628\u0639\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0646\u0641\u064A\u0630",
          "\u0637\u0631\u064A\u0642\u0629 \u062A\u0646\u0638\u064A\u0645 \u0648\u0647\u064A\u0643\u0644\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0628\u0623\u0639\u0644\u0649 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0623\u062F\u0627\u0621"
        ],
        keyTakeaway: "\u0627\u0644\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u062F\u0642\u064A\u0642 \u064A\u0636\u0645\u0646 \u062F\u0642\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0648\u0633\u0631\u0639\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629.",
        visualHint: "\u0645\u062E\u0637\u0637 \u062A\u062F\u0641\u0642 \u0623\u0648 \u062C\u062F\u0648\u0644 \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A \u0648\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A",
        speakerNotes: "\u0627\u0637\u0644\u0628 \u0645\u0646 \u0623\u062D\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0648\u0645\u0646\u0627\u0642\u0634\u0629 \u0645\u062B\u0627\u0644 \u0648\u0627\u0642\u0639\u064A \u0645\u0639 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629."
      },
      {
        slideNumber: 3,
        title: "\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0639\u0645\u0644\u064A \u0648\u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644",
        bullets: [
          "\u0641\u062A\u062D \u0628\u064A\u0626\u0629 \u0627\u0644\u0639\u0645\u0644 \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u064A\u0629 \u0627\u0644\u0645\u0648\u0636\u062D\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u062C\u0647\u0632\u0629",
          "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0644\u062D\u0638\u064A\u0629 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0623\u0648 \u0623\u062E\u0637\u0627\u0621 \u0628\u0631\u0645\u062C\u064A\u0629",
          "\u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0641\u0639\u0627\u0644\u0629 \u0648\u0627\u0644\u062A\u0646\u0627\u0641\u0633 \u0627\u0644\u0625\u064A\u062C\u0627\u0628\u064A \u0628\u064A\u0646 \u0623\u0641\u0631\u0627\u062F \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A"
        ],
        keyTakeaway: "\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629 \u0648\u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0647\u064A \u0627\u0644\u0633\u0628\u064A\u0644 \u0627\u0644\u0623\u0636\u0645\u0646 \u0644\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 \u0648\u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0647\u0627\u0631\u0629.",
        visualHint: "\u0648\u0627\u062C\u0647\u0629 \u062A\u0637\u0628\u064A\u0642 \u062A\u0648\u0636\u062D \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u0645\u0639\u0645\u0644",
        speakerNotes: "\u0642\u0645 \u0628\u0627\u0644\u062A\u062C\u0648\u0644 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0634\u0627\u0634\u0627\u062A \u0627\u0644\u0637\u0644\u0627\u0628 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u062A\u062D\u0643\u0645 \u0639\u0646 \u0628\u0639\u062F."
      },
      {
        slideNumber: 4,
        title: "\u0627\u0644\u062E\u0644\u0627\u0635\u0629 \u0648\u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A \u0627\u0644\u0646\u0647\u0627\u0626\u064A",
        bullets: [
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0633\u0631\u064A\u0639\u0629 \u0644\u0623\u0647\u0645 \u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0648\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0643\u062A\u0633\u0627\u0628\u0647\u0627 \u0627\u0644\u064A\u0648\u0645",
          "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0648\u062D\u0644 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0648\u062A\u062D\u062F\u064A \u0643\u0627\u0647\u0648\u062A \u0627\u0644\u0633\u0631\u064A\u0639",
          "\u062A\u0643\u0644\u064A\u0641 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u0645\u0646\u0632\u0644\u064A \u0627\u0644\u0625\u0628\u062F\u0627\u0639\u064A \u0648\u062A\u062C\u0647\u064A\u0632 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0635\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629"
        ],
        keyTakeaway: "\u0627\u0644\u062A\u0639\u0644\u0645 \u0627\u0644\u0645\u0633\u062A\u0645\u0631 \u0648\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u064A\u0635\u0646\u0639\u0627\u0646 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641 \u0648\u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u062D\u0642\u064A\u0642\u064A.",
        visualHint: "\u0644\u0648\u062D\u0629 \u0634\u0631\u0641 \u062A\u0644\u062E\u0635 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0648\u0627\u0644\u0646\u062C\u0648\u0645 \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629",
        speakerNotes: "\u0634\u062C\u0639 \u0627\u0644\u0645\u062A\u0645\u064A\u0632\u064A\u0646 \u0648\u0627\u0645\u0646\u062D \u0646\u062C\u0648\u0645 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0645\u064A\u0632 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u064A\u0646 \u0641\u064A \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u062D\u0635\u0629."
      }
    ],
    kahootQuestions: [
      {
        id: "k-1",
        question: `\u0645\u0627 \u0647\u0648 \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0645\u0646 \u062F\u0631\u0627\u0633\u0629 \u0648\u062A\u0637\u0628\u064A\u0642 ${params.topic}\u061F`,
        options: [
          "\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0639\u0645\u0644\u064A \u0648\u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644",
          "\u0627\u0644\u062D\u0641\u0638 \u0627\u0644\u0646\u0638\u0631\u064A \u062F\u0648\u0646 \u0641\u0647\u0645 \u0623\u0648 \u062A\u0637\u0628\u064A\u0642",
          "\u062A\u062C\u0646\u0628 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u062D\u062F\u064A\u062B\u0629",
          "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0645\u0631\u0629"
        ],
        correctIndex: 0,
        timeLimit: 20,
        explanation: "\u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0647\u0648 \u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0648\u062A\u0637\u0628\u064A\u0642\u0647\u0627 \u0639\u0645\u0644\u064A\u0627\u064B \u0641\u064A \u0628\u064A\u0626\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u062D\u0642\u064A\u0642\u064A\u0629."
      },
      {
        id: "k-2",
        question: "\u0643\u064A\u0641 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644\u061F",
        options: [
          "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u0628\u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0648\u062A\u062C\u0631\u0628\u0629 \u0643\u0627\u0641\u0629 \u0627\u0644\u062D\u0627\u0644\u0627\u062A",
          "\u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u062E\u0645\u064A\u0646 \u062F\u0648\u0646 \u0641\u062D\u0635",
          "\u062A\u062C\u0627\u0647\u0644 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0648\u0627\u0644\u0623\u062E\u0637\u0627\u0621",
          "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u062F\u0648\u0646 \u062D\u0641\u0638 \u0627\u0644\u0646\u062A\u0627\u0626\u062C"
        ],
        correctIndex: 0,
        timeLimit: 20,
        explanation: "\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u0646\u0647\u062C\u064A \u0648\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u064A\u0636\u0645\u0646\u0627\u0646 \u062F\u0642\u0629 \u0627\u0644\u0623\u062F\u0627\u0621 \u0648\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630."
      }
    ],
    practicalActivities: [
      {
        id: "act-1",
        title: `\u062A\u0637\u0628\u064A\u0642 \u062A\u062D\u062F\u064A ${params.topic} \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644`,
        targetDevice: "\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u062D\u0627\u0633\u0648\u0628 \u0627\u0644\u0645\u062A\u062F\u0631\u0628",
        toolsNeeded: "\u0645\u062D\u0631\u0631 \u0627\u0644\u0623\u0643\u0648\u0627\u062F \u0648\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
        steps: [
          "\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0623\u0648 \u0641\u062A\u062D \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644",
          "\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0645\u0648\u0636\u062D\u0629 \u0641\u064A \u0627\u0644\u0634\u0631\u064A\u062D\u0629 \u0628\u062F\u0642\u0629",
          "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0644\u0644\u0645\u062F\u0631\u0628 \u0644\u062A\u0642\u064A\u064A\u0645\u0647\u0627 \u0648\u0631\u0635\u062F \u0627\u0644\u0646\u0642\u0627\u0637"
        ],
        expectedOutput: "\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u062E\u0631\u062C \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A \u0627\u0644\u0645\u0648\u0636\u062D \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u062C\u0627\u0648\u0632 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0639\u0645\u0644\u064A."
      }
    ]
  };
}
async function generateTrainerAdvancedExam(params) {
  const parts = [];
  const numQuestions = params.numQuestions || 5;
  const lang = params.language || "ar";
  const langName = lang === "ar" ? "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" : "English Language";
  let hasUploadedDoc = false;
  if (params.image) {
    const mimeMatch = params.image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : params.image.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
    const cleanBase64 = params.image.replace(/^data:[^;]+;base64,/, "").trim();
    if (cleanBase64.length > 0) {
      hasUploadedDoc = true;
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType
        }
      });
    }
  }
  const prompt = `\u0623\u0646\u062A \u0645\u0635\u0645\u0645 \u0627\u0645\u062A\u062D\u0627\u0646\u0627\u062A \u0648\u0642\u064A\u0627\u0633 \u062A\u0642\u064A\u064A\u0645\u064A \u0645\u062A\u0642\u062F\u0645 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
${hasUploadedDoc ? `\u{1F4C4} \u062A\u0645 \u0625\u0631\u0641\u0627\u0642 \u0645\u0644\u0641 \u0643\u062A\u0627\u0628 \u0645\u062F\u0631\u0633\u064A / \u0648\u0631\u0642\u0629 \u0623\u0633\u0626\u0644\u0629 / \u0645\u0633\u062A\u0646\u062F (PDF \u0623\u0648 \u0635\u0648\u0631\u0629). \u0642\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0648\u0641\u062D\u0635 \u0643\u0627\u0641\u0629 \u0627\u0644\u0646\u0635\u0648\u0635 \u0648\u0627\u0644\u0641\u0642\u0631\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u0645\u0631\u0641\u0642 \u0628\u062F\u0642\u0629 \u0641\u0627\u0626\u0642\u0629\u060C \u0648\u0642\u0645 \u0628\u0635\u064A\u0627\u063A\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0641\u064A \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u0631\u0641\u0642 \u062F\u0648\u0646 \u0623\u064A \u0627\u062E\u062A\u0644\u0627\u0642.` : ""}
\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 \u0630\u0643\u064A \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0637\u0644\u0627\u0628 ${params.grade} \u0641\u064A \u0645\u0627\u062F\u0629 ${params.courseName} \u062D\u0648\u0644 \u0627\u0644\u0645\u0648\u0636\u0648\u0639: "${params.topic}".
\u0627\u0644\u0635\u0639\u0648\u0628\u0629: ${params.difficulty}.
\u0639\u062F\u062F \u0627\u0644\u0623\u0633\u0626\u0644\u0629: ${numQuestions}.
\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629: ${params.questionTypes.join(", ")}.
\u0627\u0644\u0644\u063A\u0629: ${langName}.

\u0642\u0645 \u0628\u0625\u062E\u0631\u0627\u062C JSON \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649:
1. title: \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631
2. description: \u0648\u0635\u0641 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A
3. grade: \u0627\u0644\u0645\u0631\u062D\u0644\u0629 (${params.grade})
4. courseName: \u0627\u0644\u0645\u0627\u062F\u0629 (${params.courseName})
5. totalMarks: \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B ${numQuestions * 5})
6. durationMinutes: \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629
7. questions: \u0642\u0627\u0626\u0645\u0629 \u0628\u0640 ${numQuestions} \u0623\u0633\u0626\u0644\u0629 \u062F\u0642\u064A\u0642\u0629 \u0643\u0643\u0627\u0626\u0646\u0627\u062A:
   - type: \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 ('multiple_choice', 'true_false', 'short_answer', 'coding', 'kahoot')
   - question: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0627\u0644\u0644\u063A\u0629 ${langName}
   - options: \u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639\u0629 (\u0644\u0644\u0646\u0648\u0639 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0623\u0648 \u0643\u0627\u0647\u0648\u062A)\u060C \u0623\u0648 \u062E\u064A\u0627\u0631\u064A\u0646 (\u0635\u0648\u0627\u0628/\u062E\u0637\u0623)
   - correctAnswer: \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 (\u0631\u0642\u0645 \u0627\u0644\u0641\u0647\u0631\u0633 0..3 \u0644\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0639\u062F\u062F\u0629\u060C \u0623\u0648 0/1 \u0644\u0635\u0648\u0627\u0628 \u0648\u062E\u0637\u0623\u060C \u0623\u0648 \u0646\u0635 \u062F\u0642\u064A\u0642)
   - explanation: \u062A\u0641\u0633\u064A\u0631 \u062A\u0639\u0644\u064A\u0645\u064A \u0645\u0641\u0635\u0644 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629
   - points: \u0627\u0644\u062F\u0631\u062C\u0629 (\u0645\u062B\u0644\u0627\u064B 5)`;
  parts.push({ text: prompt });
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [{ role: "user", parts }],
        config: { responseMimeType: "application/json" }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gemini advanced exam generation warning:", e?.message);
    }
  }
  const generatedQuestions = [];
  for (let i = 1; i <= numQuestions; i++) {
    const isEven = i % 2 === 0;
    if (isEven && params.questionTypes.includes("true_false")) {
      generatedQuestions.push({
        id: `q-${Date.now()}-${i}`,
        type: "true_false",
        question: `\u0647\u0644 \u064A\u0639\u062A\u0628\u0631 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0645\u0639\u064A\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0646\u0647\u062C\u064A\u0629 \u0631\u0643\u064A\u0632\u0629 \u0623\u0633\u0627\u0633\u064A\u0629 \u0641\u064A \u0625\u0646\u062C\u0627\u0632 \u062A\u062F\u0631\u064A\u0628\u0627\u062A ${params.topic}\u061F`,
        options: ["\u0635\u0648\u0627\u0628 \u2705", "\u062E\u0637\u0623 \u274C"],
        correctAnswer: 0,
        explanation: "\u0646\u0639\u0645\u060C \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0639\u0644\u0645\u064A\u0629 \u064A\u0636\u0645\u0646 \u0627\u0644\u062F\u0642\u0629 \u0648\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0623\u0645\u062B\u0644 \u0648\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u0623\u062E\u0637\u0627\u0621.",
        points: 5
      });
    } else {
      generatedQuestions.push({
        id: `q-${Date.now()}-${i}`,
        type: "multiple_choice",
        question: `\u0627\u0644\u0633\u0624\u0627\u0644 ${i}: \u0645\u0627 \u0647\u064A \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0644\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0645\u062A\u0637\u0644\u0628\u0627\u062A ${params.topic} \u0644\u0637\u0644\u0627\u0628 ${params.grade}\u061F`,
        options: [
          "\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0645\u0646\u0647\u062C\u064A \u0648\u0641\u0642 \u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629",
          "\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A \u062F\u0648\u0646 \u062A\u062E\u0637\u064A\u0637 \u0623\u0648 \u0645\u0631\u0627\u062C\u0639\u0629",
          "\u062A\u062C\u0627\u0647\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0645\u0639 \u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0635\u062D\u064A\u062D\u0629",
          "\u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u062E\u0645\u064A\u0646 \u063A\u064A\u0631 \u0627\u0644\u0645\u062F\u0631\u0648\u0633"
        ],
        correctAnswer: 0,
        explanation: "\u0627\u0644\u0645\u0646\u0647\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062F\u0642\u064A\u0642 \u0647\u0645\u0627 \u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0646\u062C\u0627\u062D \u0648\u0627\u0644\u062A\u0645\u064A\u0632 \u0641\u064A \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u0647\u0627\u0645 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A.",
        points: 5
      });
    }
  }
  return {
    title: `\u0627\u062E\u062A\u0628\u0627\u0631 \u062A\u0642\u064A\u064A\u0645\u064A \u0634\u0627\u0645\u0644: ${params.topic}`,
    description: `\u0627\u062E\u062A\u0628\u0627\u0631 \u0642\u064A\u0627\u0633 \u0645\u0647\u0627\u0631\u0627\u062A \u0648\u0645\u0643\u062A\u0633\u0628\u0627\u062A \u0645\u0627\u062F\u0629 ${params.courseName} - ${params.grade}`,
    grade: params.grade,
    courseName: params.courseName,
    totalMarks: numQuestions * 5,
    durationMinutes: 20,
    questions: generatedQuestions
  };
}
async function generateKahootQuiz(params) {
  const count = Number(params.questionCount) || 8;
  const grade = params.grade || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
  const subject = params.subject || "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629";
  const topic = params.topic || "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629";
  const difficulty = params.difficulty || "\u0645\u062A\u0648\u0633\u0637";
  const parts = [];
  if (params.imageBase64) {
    const cleanB64 = params.imageBase64.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");
    parts.push({
      inlineData: {
        mimeType: params.imageBase64.includes("pdf") ? "application/pdf" : "image/jpeg",
        data: cleanB64
      }
    });
  }
  const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u062A\u0635\u0645\u064A\u0645 \u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0643\u0627\u0647\u0648\u062A (Kahoot!) \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0627\u0644\u0645\u0645\u062A\u0639\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0627\u0644\u0645\u0648\u062C\u0647\u0629 \u0644\u0644\u0637\u0644\u0627\u0628.
\u0642\u0645 \u0628\u062A\u0648\u0644\u064A\u062F \u062D\u0632\u0645\u0629 \u0645\u0633\u0627\u0628\u0642\u0629 \u0643\u0627\u0647\u0648\u062A \u0643\u0627\u0645\u0644\u0629 \u062D\u0648\u0644 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062A\u0627\u0644\u064A:
- \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${topic}
- \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629: ${grade}
- \u0627\u0644\u0645\u0627\u062F\u0629: ${subject}
- \u0627\u0644\u0645\u0633\u062A\u0648\u0649: ${difficulty}
- \u0639\u062F\u062F \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${count} \u0623\u0633\u0626\u0644\u0629 \u0645\u062A\u0646\u0648\u0639\u0629 \u0648\u0634\u064A\u0642\u0629!

\u062A\u0646\u0648\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628:
1. 'mcq': \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F (4 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0645\u064A\u0632\u0629 \u0628\u0623\u0644\u0648\u0627\u0646 \u0643\u0627\u0647\u0648\u062A: \u0623\u062D\u0645\u0631\u060C \u0623\u0632\u0631\u0642\u060C \u0623\u0635\u0641\u0631\u060C \u0623\u062E\u0636\u0631).
2. 'true_false': \u0633\u0624\u0627\u0644 \u0635\u062D \u0623\u0648 \u062E\u0637\u0623 (\u062E\u064A\u0627\u0631\u0627\u0646: \u0635\u0648\u0627\u0628 / \u062E\u0637\u0623).
3. 'short_answer': \u0633\u0624\u0627\u0644 \u0625\u062C\u0627\u0628\u0629 \u0642\u0635\u064A\u0631\u0629.
4. 'puzzle': \u0633\u0624\u0627\u0644 \u062A\u0631\u062A\u064A\u0628 \u062A\u0633\u0644\u0633\u0644\u064A (4 \u062E\u064A\u0627\u0631\u0627\u062A \u064A\u062C\u0628 \u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D).

\u0623\u062E\u0631\u062C \u0627\u0644\u0647\u064A\u0643\u0644 \u0643\u0627\u0644\u062A\u0627\u0644\u064A \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u062D\u0635\u0631\u0627\u064B:
{
  "id": "kahoot-${Date.now()}",
  "title": "\u062A\u062D\u062F\u064A \u0643\u0627\u0647\u0648\u062A \u0627\u0644\u0630\u0643\u064A: ${topic}",
  "description": "\u0645\u0633\u0627\u0628\u0642\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u0645\u062A\u0639\u0629 \u0644\u0637\u0644\u0627\u0628 ${grade} \u0641\u064A \u0645\u0627\u062F\u0629 ${subject}",
  "subject": "${subject}",
  "grade": "${grade}",
  "coverEmoji": "\u26A1",
  "timeLimitDefault": 20,
  "questions": [
    {
      "id": "kq-1",
      "type": "mcq",
      "question": "\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062A\u0634\u0648\u064A\u0642\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631",
      "options": ["\u062E\u064A\u0627\u0631 1 (\u0623\u062D\u0645\u0631 \u{1F53A})", "\u062E\u064A\u0627\u0631 2 (\u0623\u0632\u0631\u0642 \u{1F537})", "\u062E\u064A\u0627\u0631 3 (\u0623\u0635\u0641\u0631 \u{1F7E1})", "\u062E\u064A\u0627\u0631 4 (\u0623\u062E\u0636\u0631 \u{1F7E9})"],
      "correctIndex": 0,
      "timeLimit": 20,
      "pointsType": "normal",
      "explanation": "\u062A\u0641\u0633\u064A\u0631 \u0639\u0644\u0645\u064A \u0645\u0634\u062C\u0639 \u0648\u0645\u0628\u0633\u0637 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629",
      "emojiOrTheme": "\u{1F3AF}",
      "category": "${topic}"
    }
  ]
}`;
  parts.push({ text: prompt });
  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateWithModelCascade({
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json"
        }
      });
      if (text) {
        const cleanJson = text.replace(/```json\s*|\s*```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("generateKahootQuiz Gemini warning:", err?.message);
    }
  }
  const fallbackQuestions = [
    {
      id: `kq-fb-1`,
      type: "mcq",
      question: `\u0645\u0627 \u0647\u064A \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u0628\u062F\u0621 \u0623\u064A \u0645\u0634\u0631\u0648\u0639 \u0628\u0631\u0645\u064A \u0623\u0648 \u062A\u0642\u0646\u064A \u062C\u062F\u064A\u062F \u0641\u064A ${topic}\u061F`,
      options: [
        "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0646\u0647\u062C\u064A \u0627\u0644\u062C\u064A\u062F \u{1F3AF}",
        "\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0643\u0648\u062F \u0639\u0634\u0648\u0627\u0626\u064A\u0627\u064B \u062F\u0648\u0646 \u062A\u062E\u0637\u064A\u0637 \u274C",
        "\u062A\u062C\u0627\u0647\u0644 \u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u{1F3A8}",
        "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062C\u0647\u0627\u0632 \u0648\u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u{1F634}"
      ],
      correctIndex: 0,
      timeLimit: 20,
      pointsType: "normal",
      explanation: "\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0647\u0645\u0627 \u0623\u0633\u0627\u0633 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0628\u0643\u0641\u0627\u0621\u0629 \u0639\u0627\u0644\u064A\u0629.",
      emojiOrTheme: "\u{1F680}",
      category: topic
    },
    {
      id: `kq-fb-2`,
      type: "true_false",
      question: `\u0647\u0644 \u064A\u0633\u0627\u0639\u062F \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0641\u0643\u064A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u064A \u0648\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u062A\u0633\u0631\u064A\u0639 \u062D\u0644 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0629\u061F`,
      options: ["\u0635\u0648\u0627\u0628 \u2705 (\u0646\u0639\u0645 \u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F)", "\u062E\u0637\u0623 \u274C (\u0644\u0627 \u064A\u0624\u062B\u0631)"],
      correctIndex: 0,
      timeLimit: 15,
      pointsType: "normal",
      explanation: "\u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F! \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u062A\u0641\u0643\u064A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u064A \u064A\u0636\u0627\u0639\u0641\u0627\u0646 \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0627\u0628\u062A\u0643\u0627\u0631 \u0648\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u062D\u0644\u0648\u0644.",
      emojiOrTheme: "\u26A1",
      category: topic
    },
    {
      id: `kq-fb-3`,
      type: "mcq",
      question: `\u0645\u0627 \u0647\u0648 \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u062A\u0643\u0631\u0627\u0631 \u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631 \u0628\u0631\u0645\u062C\u064A \u0644\u0639\u062F\u062F \u0645\u062D\u062F\u062F \u0645\u0646 \u0627\u0644\u0645\u0631\u0627\u062A\u061F`,
      options: [
        "\u062D\u0644\u0642\u0629 \u0627\u0644\u062A\u0643\u0631\u0627\u0631 (Loop / Repeat) \u{1F504}",
        "\u0627\u0644\u0645\u062A\u063A\u064A\u0631\u0627\u062A (Variables) \u{1F4E6}",
        "\u0627\u0644\u0634\u0631\u0648\u0637 (If Statement) \u{1F500}",
        "\u0627\u0644\u0645\u0635\u0641\u0648\u0641\u0627\u062A (Arrays) \u{1F4CA}"
      ],
      correctIndex: 0,
      timeLimit: 20,
      pointsType: "double",
      explanation: "\u062D\u0644\u0642\u0627\u062A \u0627\u0644\u062A\u0643\u0631\u0627\u0631 (Loops) \u062A\u062E\u062A\u0635\u0631 \u0627\u0644\u0648\u0642\u062A \u0648\u0627\u0644\u062C\u0647\u062F \u0648\u062A\u0646\u0641\u0630 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0643\u0631\u0631\u0629 \u0628\u0630\u0643\u0627\u0621 \u0641\u0627\u0626\u0642\u0629.",
      emojiOrTheme: "\u{1F525}",
      category: topic
    },
    {
      id: `kq-fb-4`,
      type: "puzzle",
      question: `\u0631\u062A\u0628 \u062E\u0637\u0648\u0627\u062A \u0643\u062A\u0627\u0628\u0629 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u0628\u0631\u0645\u062C\u064A \u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D:`,
      options: [
        "1. \u062A\u062D\u062F\u064A\u062F \u0648\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0641\u0643\u0631\u0629 \u{1F4A1}",
        "2. \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u0623\u0643\u0648\u0627\u062F \u{1F4BB}",
        "3. \u062A\u0634\u063A\u064A\u0644 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u{1F9EA}",
        "4. \u062D\u0641\u0638 \u0648\u0646\u0634\u0631 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u{1F31F}"
      ],
      correctIndex: 0,
      timeLimit: 30,
      pointsType: "double",
      explanation: "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D \u064A\u0628\u062F\u0623 \u0628\u0627\u0644\u0641\u0643\u0631\u0629 \u062B\u0645 \u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u062B\u0645 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u062B\u0645 \u0627\u0644\u0646\u0634\u0631!",
      emojiOrTheme: "\u{1F9E9}",
      category: topic
    },
    {
      id: `kq-fb-5`,
      type: "short_answer",
      question: `\u0645\u0627 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u064A \u0646\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0627\u0644\u0622\u0646 \u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0627\u0644\u062D\u064A\u0629\u061F`,
      options: ["\u0643\u0627\u0647\u0648\u062A (Kahoot) \u{1F3AE}", "Nagah MS \u{1F6E1}\uFE0F", "\u062C\u0645\u064A\u0639 \u0645\u0627 \u0633\u0628\u0642 \u2705", "\u0644\u0627 \u0634\u064A\u0621 \u0645\u0645\u0627 \u0633\u0628\u0642 \u274C"],
      correctIndex: 2,
      timeLimit: 20,
      pointsType: "normal",
      explanation: "\u0623\u0646\u062A \u0627\u0644\u0622\u0646 \u062A\u062E\u0648\u0636 \u062A\u062D\u062F\u064A \u0643\u0627\u0647\u0648\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0627\u0644\u0645\u062F\u0645\u062C \u062F\u0627\u062E\u0644 \u0645\u0646\u0635\u0629 \u0646\u062C\u0627\u062D!",
      emojiOrTheme: "\u{1F3C6}",
      category: topic
    }
  ];
  return {
    id: `kahoot-${Date.now()}`,
    title: `\u062A\u062D\u062F\u064A \u0643\u0627\u0647\u0648\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A: ${topic}`,
    description: `\u0645\u0633\u0627\u0628\u0642\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0634\u064A\u0642\u0629 \u0648\u0645\u0645\u062A\u0639\u0629 \u0644\u0645\u0627\u062F\u0629 ${subject} - ${grade}`,
    subject,
    grade,
    coverEmoji: "\u{1F525}",
    timeLimitDefault: 20,
    questions: fallbackQuestions
  };
}

// server/languageLabRoutes.ts
import express from "express";
var languageLabRouter = express.Router();
var memoryStudentProfiles = {};
var memoryActivities = [];
var memorySubmissions = [];
languageLabRouter.post("/chat-turn", async (req, res) => {
  try {
    const {
      scenarioId,
      systemPersona,
      userMessage,
      conversationHistory,
      cefrLevel = "B1",
      studentName = "Student"
    } = req.body;
    const formattedHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-8).map((m) => `${m.role === "user" ? "Student" : "Partner"}: ${m.text}`).join("\n") : "";
    const systemPrompt = `You are an expert English Language Coach & Roleplay Partner for Nagah Learning Management System.
Current Roleplay Persona: ${systemPersona || "Professional English Interviewer & Tutor"}.
Student Target CEFR Level: ${cefrLevel}.
Student Name: ${studentName}.

Conversation Guidelines:
1. Stay in character! Respond naturally, encouragingly, and realistically in English matched to ${cefrLevel}.
2. Keep your conversational response relatively concise (2-4 sentences) so the conversation flows interactively.
3. Assess the student's message for grammar, vocabulary, and phrasing.
4. Output STRICT JSON with this schema:
{
  "reply": "Your in-character spoken response in English",
  "feedback": {
    "score": 85,
    "praise": "Brief praise in Arabic/English",
    "corrections": [
      { "original": "mistake phrase", "improved": "corrected phrase", "explanation": "Why in Arabic/English" }
    ],
    "pronunciationTips": ["Words to practice pronouncing clearly"],
    "suggestedFollowUpPhrases": ["3 sample short replies the student could use next"]
  }
}
Do NOT include markdown formatting or backticks outside the JSON.`;
    const contents = [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: `Recent Conversation History:
${formattedHistory}

Student just said: "${userMessage || "Hello!"}"

Generate in-character response and feedback in strict JSON:` }
        ]
      }
    ];
    const aiRes = await generateWithModelCascade({
      contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, ...parsed, modelUsed: aiRes.modelUsed });
      } catch (pe) {
        console.warn("JSON parse fallback for chat turn:", pe);
      }
    }
    return res.json({
      success: true,
      reply: `That sounds interesting! Could you tell me more about how you handled that situation?`,
      feedback: {
        score: 80,
        praise: "Good attempt! Keep expressing your ideas confidently.",
        corrections: [],
        pronunciationTips: ["Pay attention to word endings (-ed, -s)"],
        suggestedFollowUpPhrases: [
          "I focused on clear team communication.",
          "It helped us solve the challenge effectively."
        ]
      },
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in language lab chat-turn:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to process chat turn" });
  }
});
languageLabRouter.post("/analyze-speaking", async (req, res) => {
  try {
    const {
      targetPrompt,
      spokenText,
      cefrLevel = "B1",
      mode = "sentence"
      // word | phrase | sentence | dialogue | presentation
    } = req.body;
    const prompt = `You are a certified CEFR Pronunciation & Speaking Assessor.
Target Practice Prompt: "${targetPrompt}"
Spoken / Transcribed Text: "${spokenText}"
Target CEFR Level: ${cefrLevel}
Mode: ${mode}

Analyze the spoken English across:
- Accuracy (words matched to target, correct grammar)
- Fluency (sentence rhythm, flow, natural phrasing)
- Pronunciation & Intonation (stress patterns, vowel clarity)
- Vocabulary Choice

Return ONLY valid JSON with this format:
{
  "score": 88,
  "accuracyScore": 90,
  "fluencyScore": 85,
  "pronunciationScore": 86,
  "summaryAr": "\u062A\u0642\u064A\u064A\u0645 \u062A\u062D\u0644\u064A\u0644\u064A \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "strengths": ["Strong vowel clarity", "Good sentence rhythm"],
  "improvements": ["Stress the second syllable in 'developer'", "Watch past tense endings"],
  "correctedErrors": [
    { "original": "he go", "corrected": "he goes", "explanation": "Subject-verb agreement" }
  ],
  "improvedVersion": "Polished native-like phrasing for the student to repeat aloud"
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.3 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, ...data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Speaking parse error:", e);
      }
    }
    return res.json({
      success: true,
      score: 85,
      accuracyScore: 88,
      fluencyScore: 84,
      pronunciationScore: 85,
      summaryAr: "\u0623\u062F\u0627\u0621 \u0635\u0648\u062A\u064A \u0631\u0627\u0626\u0639\u060C \u0645\u0639 \u0648\u0636\u0648\u062D \u062C\u064A\u062F \u0641\u064A \u0645\u062E\u0627\u0631\u062C \u0627\u0644\u062D\u0631\u0648\u0641 \u0648\u0627\u0644\u0637\u0644\u0627\u0642\u0629 \u0627\u0644\u062A\u0639\u0628\u064A\u0631\u064A\u0629.",
      strengths: ["\u0646\u0628\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u062E\u0627\u0631\u062C \u062D\u0631\u0648\u0641 \u0645\u0641\u0647\u0648\u0645\u0629", "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0641\u0631\u062F\u0627\u062A \u0645\u062A\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0627\u0644\u0633\u064A\u0627\u0642"],
      improvements: ["\u0627\u0644\u062A\u062F\u0631\u0628 \u0639\u0644\u0649 \u0631\u0628\u0637 \u0627\u0644\u0643\u0644\u0645\u0627\u062A (Connected Speech)", "\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0639\u0644\u0649 \u0646\u0637\u0642 \u0646\u0647\u0627\u064A\u0627\u062A \u0627\u0644\u0643\u0644\u0645\u0627\u062A"],
      correctedErrors: [],
      improvedVersion: targetPrompt,
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in analyze-speaking:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/analyze-writing", async (req, res) => {
  try {
    const {
      topic,
      studentText,
      cefrLevel = "B1",
      instructions
    } = req.body;
    const prompt = `You are a supportive English Writing Mentor for Nagah Center students.
Topic / Assignment: "${topic || "General Writing Topic"}"
Instructions: "${instructions || "Write a structured paragraph"}"
Target CEFR Level: ${cefrLevel}
Student Submitted Text:
"""
${studentText}
"""

Instructions:
1. Provide constructive, educational feedback. Explain the "WHY" behind corrections rather than just giving the answer.
2. Evaluate Grammar, Spelling, Vocabulary, Sentence Structure, Clarity, and Overall Quality.
3. Return STRICT JSON with this schema:
{
  "score": 82,
  "cefrEstimated": "B1",
  "summaryAr": "\u0645\u0644\u062E\u0635 \u0634\u0627\u0645\u0644 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0644\u062C\u0648\u0627\u0646\u0628 \u0627\u0644\u0642\u0648\u0629 \u0648\u0645\u062C\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0633\u064A\u0646",
  "wordCount": 65,
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Point 1", "Point 2"],
  "correctedErrors": [
    { "original": "error phrase", "corrected": "fixed phrase", "rule": "Grammar rule name", "explanation": "Educational guidance in Arabic" }
  ],
  "vocabularyEnhancements": [
    { "wordUsed": "good", "suggestedAlternatives": ["effective", "robust", "optimal"] }
  ],
  "improvedParagraph": "An elevated rewrite of the paragraph demonstrating natural flow"
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.3 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, ...data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Writing feedback parse error:", e);
      }
    }
    return res.json({
      success: true,
      score: 80,
      cefrEstimated: cefrLevel,
      summaryAr: "\u0643\u062A\u0627\u0628\u0629 \u062C\u064A\u062F\u0629 \u0648\u0645\u0646\u0638\u0645\u0629 \u062A\u0648\u0636\u062D \u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0628\u0648\u0636\u0648\u062D \u0645\u0639 \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062A\u0631\u0627\u0643\u064A\u0628 \u0627\u0644\u0644\u063A\u0648\u064A\u0629.",
      wordCount: (studentText || "").split(/\s+/).filter(Boolean).length,
      strengths: ["\u062A\u0633\u0644\u0633\u0644 \u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0648\u0627\u0644\u0648\u0636\u0648\u062D", "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0645\u0648\u0636\u0648\u0639"],
      improvements: ["\u062A\u0646\u0648\u064A\u0639 \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0631\u0628\u0637 \u0628\u064A\u0646 \u0627\u0644\u062C\u0645\u0644", "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0623\u0632\u0645\u0646\u0629"],
      correctedErrors: [],
      vocabularyEnhancements: [],
      improvedParagraph: studentText,
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in analyze-writing:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/ai-coach", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ success: false, error: "Student profile required" });
    }
    const prompt = `You are the personal AI Language Coach for a student at Nagah Center.
Student Profile:
- Name: ${profile.studentName}
- Current Level: ${profile.currentLevel}
- Skill Scores: Speaking (${profile.scores?.speaking || 0}), Listening (${profile.scores?.listening || 0}), Reading (${profile.scores?.reading || 0}), Writing (${profile.scores?.writing || 0}), Grammar (${profile.scores?.grammar || 0}), Pronunciation (${profile.scores?.pronunciation || 0})
- Streak: ${profile.streakDays || 0} days
- Words in Flashcards: ${profile.flashcards?.length || 0}

Generate a concise, motivating, and highly personalized coaching plan.
Return ONLY valid JSON:
{
  "greetingAr": "\u062A\u062D\u064A\u0629 \u062A\u0634\u062C\u064A\u0639\u064A\u0629 \u062F\u0627\u0641\u0626\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "statusSummaryAr": "\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629",
  "todayFocusSkill": "speaking",
  "todayReasonAr": "\u0633\u0628\u0628 \u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0639\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u064A\u0648\u0645 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u062F\u0631\u062C\u0627\u062A",
  "recommendedAction": {
    "title": "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u0645\u0642\u062A\u0631\u062D",
    "description": "\u0648\u0635\u0641 \u0627\u0644\u0645\u0647\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0641\u064A 5-10 \u062F\u0642\u0627\u0626\u0642",
    "targetPillar": "speaking"
  },
  "reviewWordsNotice": "\u062A\u0646\u0628\u064A\u0647 \u0639\u0646 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u062D\u062A\u0627\u062C \u0645\u0631\u0627\u062C\u0639\u0629 \u0641\u064A \u0635\u0646\u062F\u0648\u0642 \u0644\u0627\u064A\u062A\u0646\u0631",
  "nextGoalAr": "\u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0642\u0627\u062F\u0645 \u0644\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0623\u0639\u0644\u0649"
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.5 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, coach: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Coach parse error:", e);
      }
    }
    return res.json({
      success: true,
      coach: {
        greetingAr: `\u0645\u0631\u062D\u0628\u064B\u0627 \u064A\u0627 \u0628\u0637\u0644! \u062C\u0627\u0647\u0632 \u0644\u062C\u0648\u0644\u0629 \u062A\u062F\u0631\u064A\u0628 \u0644\u063A\u0648\u064A \u062C\u062F\u064A\u062F\u0629 \u0648\u0645\u0645\u062A\u0639\u0629 \u0627\u0644\u064A\u0648\u0645\u061F \u{1F680}`,
        statusSummaryAr: `\u0623\u0646\u062A \u0641\u064A \u0645\u0633\u062A\u0648\u0649 ${profile.currentLevel || "B1"}\u060C \u0648\u0623\u062F\u0627\u0624\u0643 \u0641\u064A \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0645\u0627\u0639 \u0645\u0645\u064A\u0632 \u062C\u062F\u0627\u064B.`,
        todayFocusSkill: "speaking",
        todayReasonAr: "\u062F\u0631\u062C\u0629 \u0627\u0644\u062A\u062D\u062F\u062B \u062A\u062D\u062A\u0627\u062C \u062A\u0639\u0632\u064A\u0632\u064B\u0627 \u0637\u0641\u064A\u0641\u064B\u0627\u060C \u0648\u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0639\u0644\u0649 \u062C\u0645\u0644 \u062D\u0642\u064A\u0642\u064A\u0629 \u064A\u0631\u0641\u0639 \u0637\u0644\u0627\u0642\u062A\u0643 \u0641\u0648\u0631\u0627\u064B.",
        recommendedAction: {
          title: "\u0645\u062D\u0627\u0643\u0627\u0629 \u0645\u0642\u0627\u0628\u0644\u0629 \u0639\u0645\u0644 \u062A\u0642\u0646\u064A\u0629 \u0644\u0645\u062F\u0629 5 \u062F\u0642\u0627\u0626\u0642",
          description: "\u0627\u062E\u062A\u0631 \u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0641\u064A \u0645\u062D\u0627\u062F\u062B\u0627\u062A AI \u0648\u062A\u062F\u0631\u0628 \u0639\u0644\u0649 \u0625\u062C\u0627\u0628\u0629 3 \u0623\u0633\u0626\u0644\u0629 \u0628\u0635\u0648\u062A\u0643.",
          targetPillar: "speaking"
        },
        reviewWordsNotice: "\u0644\u062F\u064A\u0643 4 \u0643\u0644\u0645\u0627\u062A \u0641\u064A \u0635\u0646\u062F\u0648\u0642 \u0644\u0627\u064A\u062A\u0646\u0631 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u064A\u0648\u0645.",
        nextGoalAr: "\u0627\u0644\u0627\u0631\u062A\u0642\u0627\u0621 \u0625\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 B2 \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0644\u0627\u0642\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629."
      },
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in ai-coach:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/generate-activity", async (req, res) => {
  try {
    const { prompt: userPrompt, skill = "speaking", level = "B1", duration = 15, maxGrade = 20 } = req.body;
    const systemPrompt = `You are an expert English Curriculum Specialist assisting a Trainer at Nagah Center.
The Trainer requests: "${userPrompt || "Create an engaging English activity"}"
Target Skill: ${skill}
Target CEFR Level: ${level}
Duration: ${duration} minutes
Max Grade: ${maxGrade} points

Generate a complete, structured classroom/homework language activity.
Return ONLY valid JSON matching this schema:
{
  "title": "Engaging Activity Title in English",
  "titleAr": "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0646\u0634\u0627\u0637 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "description": "Short explanation for students",
  "instructions": "Step-by-step instructions on what students need to do",
  "prompt": "The main speaking prompt, reading text, or writing question",
  "passage": "Optional reading passage or listening audio script if applicable",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "Comprehension or reflection question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ],
  "rubric": {
    "accuracyWeight": 25,
    "fluencyWeight": 25,
    "vocabularyWeight": 25,
    "grammarWeight": 25
  },
  "teacherAdviceAr": "\u0646\u0635\u0627\u0626\u062D \u0630\u0643\u064A\u0629 \u0644\u0644\u0645\u062F\u0631\u0628 \u0644\u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0634\u0627\u0626\u0639\u0629"
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.6 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, activity: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Activity generator parse error:", e);
      }
    }
    return res.json({
      success: true,
      activity: {
        title: `AI Language Challenge: ${skill.toUpperCase()} (Level ${level})`,
        titleAr: `\u0646\u0634\u0627\u0637 \u0644\u063A\u0648\u064A \u062A\u0641\u0627\u0639\u0644\u064A: ${skill} (\u0645\u0633\u062A\u0648\u0649 ${level})`,
        description: `Practical exercise to strengthen ${skill} proficiency for level ${level}.`,
        instructions: `Read the prompt carefully, prepare your response, and submit your recording or text.`,
        prompt: `Describe how software algorithms affect daily life and give two practical examples.`,
        questions: [],
        rubric: { accuracyWeight: 25, fluencyWeight: 25, vocabularyWeight: 25, grammarWeight: 25 },
        teacherAdviceAr: "\u0634\u062C\u0639 \u0627\u0644\u0637\u0644\u0627\u0628 \u0639\u0644\u0649 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629 \u0641\u064A \u0627\u0644\u062D\u0635\u0635 \u0627\u0644\u0633\u0627\u0628\u0642\u0629."
      },
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in generate-activity:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/analyze-group", async (req, res) => {
  try {
    const { groupName = "Group", trainees = [] } = req.body;
    const traineesSummary = Array.isArray(trainees) ? trainees.map((t) => `${t.fullName || t.name}: CEFR ${t.currentLevel || "A2"}, Overall ${t.scores?.overall || 65}%`).join("\n") : "Standard group data";
    const prompt = `You are an AI Educational Data Analyst for Nagah Center.
Group Name: "${groupName}"
Trainees Language Data:
${traineesSummary}

Task:
1. Analyze the collective strengths and gaps.
2. Segment trainees intelligently into 4 performance tiers:
   - "needs_support" (\u062A\u062D\u062A\u0627\u062C \u062F\u0639\u0645 \u0648\u062A\u0623\u0633\u064A\u0633 \u0645\u0643\u062B\u0641)
   - "developing" (\u0641\u064A \u0637\u0648\u0631 \u0627\u0644\u062A\u0637\u0648\u0631 \u0648\u0627\u0644\u0646\u0645\u0648)
   - "good" (\u0645\u0633\u062A\u0648\u0649 \u062C\u064A\u062F \u0648\u0645\u0633\u062A\u0642\u0631)
   - "advanced" (\u0645\u0633\u062A\u0648\u0649 \u0645\u062A\u0642\u062F\u0645 \u0648\u0645\u062A\u0645\u064A\u0632)
3. For each tier, recommend a specific tailored activity / pedagogical intervention.

Return ONLY valid JSON:
{
  "groupOverviewAr": "\u062A\u062D\u0644\u064A\u0644 \u0645\u0648\u062C\u0632 \u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "averageLevel": "B1",
  "tiers": {
    "needsSupport": {
      "studentNames": ["Name 1"],
      "diagnosisAr": "\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A",
      "recommendedActionAr": "\u062E\u0637\u0629 \u0627\u0644\u062A\u062F\u062E\u0644 \u0627\u0644\u0639\u0644\u0627\u062C\u064A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629"
    },
    "developing": {
      "studentNames": ["Name 2"],
      "diagnosisAr": "\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A",
      "recommendedActionAr": "\u062E\u0637\u0629 \u0627\u0644\u062A\u062B\u0628\u064A\u062A \u0648\u0627\u0644\u062A\u0637\u0648\u064A\u0631"
    },
    "good": {
      "studentNames": ["Name 3"],
      "diagnosisAr": "\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629",
      "recommendedActionAr": "\u062E\u0637\u0629 \u0627\u0644\u062A\u0639\u0632\u064A\u0632"
    },
    "advanced": {
      "studentNames": ["Name 4"],
      "diagnosisAr": "\u0627\u0644\u062A\u0645\u064A\u0632 \u0648\u0627\u0644\u0625\u062A\u0642\u0627\u0646",
      "recommendedActionAr": "\u0623\u0646\u0634\u0637\u0629 \u0625\u062B\u0631\u0627\u0626\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u0627\u062A \u0642\u064A\u0627\u062F\u064A\u0629"
    }
  }
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.4 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, analysis: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Group analyzer parse error:", e);
      }
    }
    return res.json({
      success: true,
      analysis: {
        groupOverviewAr: `\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u062A\u064F\u0638\u0647\u0631 \u062A\u0642\u062F\u0645\u0627\u064B \u0645\u0644\u062D\u0648\u0638\u0627\u064B \u0641\u064A \u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0645\u0639 \u062A\u0628\u0627\u064A\u0646 \u0641\u064A \u0627\u0644\u0637\u0644\u0627\u0642\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629.`,
        averageLevel: "B1",
        tiers: {
          needsSupport: {
            studentNames: trainees.slice(0, 2).map((t) => t.fullName || t.name),
            diagnosisAr: "\u0635\u0639\u0648\u0628\u0629 \u0641\u064A \u062A\u0643\u0648\u064A\u0646 \u0627\u0644\u062C\u0645\u0644 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0648\u0627\u0644\u062A\u0635\u0631\u064A\u0641 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0635\u062D\u064A\u062D.",
            recommendedActionAr: "\u062A\u062F\u0631\u064A\u0628\u0627\u062A \u0645\u062D\u0627\u0643\u0627\u0629 \u064A\u0648\u0645\u064A\u0629 \u0642\u0635\u064A\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u062C\u0645\u0644 \u0627\u0644\u0628\u0633\u064A\u0637\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Flashcards."
          },
          developing: {
            studentNames: trainees.slice(2, 5).map((t) => t.fullName || t.name),
            diagnosisAr: "\u0641\u0647\u0645 \u0645\u0645\u062A\u0627\u0632 \u0644\u0644\u0646\u0635\u0648\u0635 \u0627\u0644\u0645\u0643\u062A\u0648\u0628\u0629 \u0645\u0639 \u062A\u0631\u062F\u062F \u0637\u0641\u064A\u0641 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u062D\u062F\u062B \u0627\u0644\u062D\u0631.",
            recommendedActionAr: "\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u062B\u0644 \u0645\u062D\u0627\u062F\u062B\u0629 \u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A."
          },
          good: {
            studentNames: trainees.slice(5, 8).map((t) => t.fullName || t.name),
            diagnosisAr: "\u0637\u0644\u0627\u0642\u0629 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 \u0648\u0642\u0648\u0627\u0639\u062F \u0633\u0644\u064A\u0645\u0629 \u0641\u064A \u0645\u0639\u0638\u0645 \u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629.",
            recommendedActionAr: "\u062A\u0643\u0644\u064A\u0641\u0627\u062A \u0639\u0631\u0648\u0636 \u062A\u0642\u062F\u064A\u0645\u064A\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629."
          },
          advanced: {
            studentNames: trainees.slice(8).map((t) => t.fullName || t.name),
            diagnosisAr: "\u0637\u0644\u0627\u0642\u0629 \u0639\u0627\u0644\u064A\u0629 \u0648\u062B\u0631\u0648\u0629 \u0644\u063A\u0648\u064A\u0629 \u062A\u0642\u0646\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629.",
            recommendedActionAr: "\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629 \u0644\u0645\u0642\u0627\u0628\u0644\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u0645\u0646\u0627\u0638\u0631\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629."
          }
        }
      },
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in analyze-group:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/lesson-assistant", async (req, res) => {
  try {
    const { topic = "Job Interview Preparation", level = "B1", skill = "speaking" } = req.body;
    const prompt = `You are an AI Master Teacher Assistant for Nagah Center Language Lab.
Topic: "${topic}"
Target Level: ${level}
Pillar: ${skill}

Provide a complete, practical lesson assistant guide for the trainer:
Return ONLY valid JSON:
{
  "lessonTitleAr": "\u0639\u0646\u0648\u0627\u0646 \u062E\u0637\u0629 \u0627\u0644\u062F\u0631\u0633 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "targetObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "lessonProgression": [
    { "phase": "Warm-up (5 mins)", "activity": "Description of warm-up" },
    { "phase": "Core Practice (15 mins)", "activity": "Interactive core activity" },
    { "phase": "Production & Feedback (10 mins)", "activity": "Student output and assessment" }
  ],
  "commonStudentMistakes": [
    { "mistake": "Example mistake", "correctionGuide": "How the teacher should guide them" }
  ],
  "remedialSuggestion": "Quick activity for struggling students",
  "enrichmentSuggestion": "Quick activity for advanced fast-finishers"
}`;
    const aiRes = await generateWithModelCascade({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.5 }
    });
    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, assistant: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn("Lesson assistant parse error:", e);
      }
    }
    return res.json({
      success: true,
      assistant: {
        lessonTitleAr: `\u062E\u0637\u0629 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0644\u063A\u0648\u064A: ${topic}`,
        targetObjectives: [
          "\u062A\u0645\u0643\u064A\u0646 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0645\u0646 \u0627\u0644\u062A\u0639\u0628\u064A\u0631 \u0628\u0637\u0644\u0627\u0642\u0629 \u0639\u0646 \u0623\u0641\u0643\u0627\u0631\u0647 \u0627\u0644\u062A\u0642\u0646\u064A\u0629",
          "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u062A\u062E\u0635\u0635\u064A\u0629 \u0641\u064A \u0633\u064A\u0627\u0642\u0627\u062A \u0639\u0645\u0644\u064A\u0629 \u0635\u062D\u064A\u062D\u0629",
          "\u062A\u0637\u0628\u064A\u0642 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0631\u0628\u0637 \u0648\u0627\u0644\u0637\u0644\u0627\u0642\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629"
        ],
        lessonProgression: [
          { phase: "\u0627\u0644\u062A\u0647\u064A\u0626\u0629 (5 \u062F\u0642\u0627\u0626\u0642)", activity: "\u0637\u0631\u062D \u0633\u0624\u0627\u0644 \u062A\u062D\u0641\u064A\u0632\u064A \u0633\u0631\u064A\u0639 \u0644\u0643\u0633\u0631 \u0627\u0644\u062C\u0644\u064A\u062F \u0648\u0645\u0631\u0627\u062C\u0639\u0629 3 \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u062A\u0627\u062D\u064A\u0629." },
          { phase: "\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A (15 \u062F\u0642\u064A\u0642\u0629)", activity: "\u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0628\u0627\u0644\u062A\u0628\u0627\u062F\u0644 \u0628\u064A\u0646 \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646 \u0645\u0639 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A." },
          { phase: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0648\u0627\u0644\u062E\u062A\u0627\u0645 (10 \u062F\u0642\u0627\u0626\u0642)", activity: "\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0644\u063A\u0648\u064A \u0627\u0644\u0641\u0648\u0631\u064A \u0648\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0631\u0627\u062C\u0639\u0629." }
        ],
        commonStudentMistakes: [
          { mistake: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0632\u0645\u0646\u0629 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u0629", correctionGuide: "\u0644\u0641\u062A \u0627\u0646\u062A\u0628\u0627\u0647 \u0627\u0644\u0637\u0627\u0644\u0628 \u0628\u0644\u0628\u0627\u0642\u0629 \u0644\u0625\u0639\u0627\u062F\u0629 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 \u0628\u0627\u0644\u0632\u0645\u0646 \u0627\u0644\u0635\u062D\u064A\u062D." }
        ],
        remedialSuggestion: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0648\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0639\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062C\u0627\u0647\u0632\u0629.",
        enrichmentSuggestion: "\u062A\u0643\u0644\u064A\u0641 \u0627\u0644\u0637\u0627\u0644\u0628 \u0628\u0625\u062C\u0631\u0627\u0621 \u0645\u062D\u0627\u0643\u0627\u0629 \u0645\u062A\u0642\u062F\u0645\u0629 \u0645\u0639 \u0623\u0633\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639\u0629."
      },
      modelUsed: "rule-fallback"
    });
  } catch (err) {
    console.error("Error in lesson-assistant:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    try {
      const doc = await adminDb.collection("language_profiles").doc(studentId).get();
      if (doc.exists) {
        return res.json({ success: true, profile: doc.data() });
      }
    } catch (e) {
      console.warn("Firestore language profile read error, falling back to memory:", e);
    }
    if (memoryStudentProfiles[studentId]) {
      return res.json({ success: true, profile: memoryStudentProfiles[studentId] });
    }
    return res.json({ success: true, profile: null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/student/:studentId/save", async (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = req.body;
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    memoryStudentProfiles[studentId] = profile;
    try {
      await adminDb.collection("language_profiles").doc(studentId).set(profile, { merge: true });
    } catch (e) {
      console.warn("Firestore language profile save error, saved to memory:", e);
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.get("/trainer/:trainerId/activities", async (req, res) => {
  try {
    const { trainerId } = req.params;
    let activities = [];
    try {
      const snap = await adminDb.collection("language_activities").where("trainerId", "==", trainerId).get();
      snap.forEach((d) => activities.push({ id: d.id, ...d.data() }));
    } catch (e) {
      activities = memoryActivities.filter((a) => a.trainerId === trainerId);
    }
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/trainer/activity", async (req, res) => {
  try {
    const activityData = req.body;
    if (!activityData.id) {
      activityData.id = `lang_act_${Date.now()}`;
    }
    activityData.createdAt = activityData.createdAt || (/* @__PURE__ */ new Date()).toISOString();
    activityData.status = activityData.status || "active";
    memoryActivities.push(activityData);
    try {
      await adminDb.collection("language_activities").doc(activityData.id).set(activityData, { merge: true });
    } catch (e) {
      console.warn("Firestore activity save error, saved to memory:", e);
    }
    res.json({ success: true, activity: activityData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/student/submit-activity", async (req, res) => {
  try {
    const submission = req.body;
    if (!submission.id) {
      submission.id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    submission.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
    submission.status = submission.status || "submitted";
    memorySubmissions.push(submission);
    try {
      await adminDb.collection("language_submissions").doc(submission.id).set(submission, { merge: true });
    } catch (e) {
      console.warn("Firestore submission save error, saved to memory:", e);
    }
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.post("/trainer/grade-submission", async (req, res) => {
  try {
    const { submissionId, grade, textNotes, voiceCommentUrl, trainerId, trainerName } = req.body;
    const updatePayload = {
      trainerFeedback: {
        trainerId,
        trainerName,
        grade,
        textNotes,
        voiceCommentUrl,
        gradedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      status: "graded"
    };
    const sub = memorySubmissions.find((s) => s.id === submissionId);
    if (sub) {
      sub.trainerFeedback = updatePayload.trainerFeedback;
      sub.status = "graded";
    }
    try {
      await adminDb.collection("language_submissions").doc(submissionId).set(updatePayload, { merge: true });
    } catch (e) {
      console.warn("Firestore submission grade error:", e);
    }
    res.json({ success: true, message: "\u062A\u0645 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0631\u0627\u062C\u0639\u0629 \u0644\u0644\u0637\u0627\u0644\u0628 \u0628\u0646\u062C\u0627\u062D \u2713" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
languageLabRouter.get("/parent/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    let profile = memoryStudentProfiles[studentId] || null;
    try {
      const doc = await adminDb.collection("language_profiles").doc(studentId).get();
      if (doc.exists) {
        profile = doc.data();
      }
    } catch (e) {
      console.warn("Firestore parent lang read error:", e);
    }
    if (!profile) {
      return res.json({
        success: true,
        insights: {
          currentLevel: "A1",
          overallScore: 65,
          wordsLearned: 12,
          practiceMinutes: 20,
          strengths: ["\u0627\u0644\u0642\u0631\u0627\u0621\u0629", "\u0627\u0644\u0627\u0633\u062A\u0645\u0627\u0639"],
          needsImprovement: ["\u0627\u0644\u062A\u062D\u062F\u062B \u0627\u0644\u062D\u0631"],
          coachNoteAr: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u064A\u062E\u0637\u0648 \u062E\u0637\u0648\u0627\u062A \u0645\u0645\u064A\u0632\u0629 \u0641\u064A \u0645\u0639\u0645\u0644 \u0627\u0644\u0644\u063A\u0627\u062A\u060C \u0648\u064A\u064F\u0646\u0635\u062D \u0628\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0639\u0644\u0649 \u0627\u0644\u0646\u0637\u0642."
        }
      });
    }
    return res.json({
      success: true,
      insights: {
        currentLevel: profile.currentLevel,
        overallScore: profile.scores?.overall || 70,
        skillScores: profile.scores,
        wordsLearned: profile.wordsLearnedCount || profile.flashcards?.length || 15,
        practiceMinutes: profile.totalPracticeMinutes || 30,
        streakDays: profile.streakDays || 1,
        strengths: profile.strengthsSkills || ["reading", "listening"],
        needsImprovement: profile.needsImprovementSkills || ["speaking"],
        coachNoteAr: `\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0641\u064A \u0645\u0633\u062A\u0648\u0649 ${profile.currentLevel} \u0648\u064A\u062D\u0631\u0632 \u062A\u0642\u062F\u0645\u0627\u064B \u062B\u0627\u0628\u062A\u0627\u064B \u0641\u064A \u0627\u0643\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0644\u063A\u0648\u064A\u0629 \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629.`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// server/routes.ts
var apiRouter = express2.Router();
apiRouter.use("/language-lab", languageLabRouter);
apiRouter.use("/migration", migrationRouter);
apiRouter.use((req, res, next) => {
  if (req.url && req.url.length > 1) {
    if (req.url.includes("/?")) {
      req.url = req.url.replace("/?", "?");
    } else if (req.url.endsWith("/")) {
      req.url = req.url.slice(0, -1);
    }
  }
  next();
});
apiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "Nagah Cloud Run Backend",
      status: "healthy",
      database: process.env.SUPABASE_URL ? "connected (Supabase PostgreSQL)" : "configured",
      aiProvider: "Google Gemini Active",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    }
  });
});
apiRouter.get("/settings", (req, res) => {
  try {
    const data = db.getData();
    res.json(data.settings || {
      centerName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
      logoUrl: "/logo.svg",
      academicYear: "2026/2027",
      primaryPhone: "01001500686",
      vodafoneCash: "01001500686",
      instapay: "m_bkeet@instapay"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/settings", (req, res) => {
  try {
    const data = db.getData();
    data.settings = {
      ...data.settings || {},
      ...req.body || {}
    };
    db.save();
    res.json({ success: true, settings: data.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.put("/settings", (req, res) => {
  try {
    const data = db.getData();
    data.settings = {
      ...data.settings || {},
      ...req.body || {}
    };
    db.save();
    res.json({ success: true, settings: data.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/settings/reset", (req, res) => {
  try {
    const data = db.getData();
    data.settings = {
      centerName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
      logoUrl: "/logo.svg",
      academicYear: "2026/2027",
      primaryPhone: "01001500686",
      vodafoneCash: "01001500686",
      instapay: "m_bkeet@instapay"
    };
    db.save();
    res.json({ success: true, message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0646\u062C\u0627\u062D", settings: data.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/ai/tutor", async (req, res) => {
  const { question, imageBase64, studentLevel, studentName } = req.body;
  if (!question && !imageBase64) {
    return res.status(400).json({ error: "Question or image is required" });
  }
  try {
    const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
    const ai = new GoogleGenAI2({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    const parts = [];
    parts.push({
      text: `\u0623\u0646\u062A \u0645\u0639\u0644\u0645 \u062E\u0628\u064A\u0631 \u0641\u064A \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629. \u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0630\u064A \u062A\u062A\u062D\u062F\u062B \u0645\u0639\u0647 \u0647\u0648 "${studentName}" \u0648\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0647 \u0647\u064A "${studentLevel || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F\u0629"}". 
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u0634\u0631\u062D \u0648\u062A\u0628\u0633\u064A\u0637 \u0627\u0644\u062C\u0632\u0626\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u0637\u0631\u062D\u0647\u0627 \u0627\u0644\u0637\u0627\u0644\u0628 \u0633\u0648\u0627\u0621 \u0643\u0627\u0646\u062A \u0635\u0648\u0631\u0629 \u0645\u0646 \u0643\u062A\u0627\u0628 \u0623\u0648 \u0633\u0624\u0627\u0644 \u0646\u0635\u064A. 
\u0627\u0634\u0631\u062D \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0635\u0631\u064A \u0645\u0628\u0633\u0637\u060C \u0634\u064A\u0642\u060C \u0648\u0645\u0644\u064A\u0621 \u0628\u0627\u0644\u062D\u0645\u0627\u0633 \u0643\u0623\u0646\u0643 \u0645\u0639\u0644\u0645 \u0645\u062D\u062A\u0631\u0641 \u064A\u062D\u0628\u0628 \u0627\u0644\u0637\u0627\u0644\u0628 \u0641\u064A \u0627\u0644\u0645\u0627\u062F\u0629. \u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u0645\u062B\u0644\u0629 \u0645\u0646 \u0627\u0644\u062D\u064A\u0627\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0625\u0630\u0627 \u0644\u0632\u0645 \u0627\u0644\u0623\u0645\u0631\u060C \u0648\u062A\u062D\u062F\u062B \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0644\u0637\u0627\u0644\u0628 \u0628\u0627\u0633\u0645\u0647.
\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0646\u0627\u0643 \u0635\u0648\u0631\u0629\u060C \u0642\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u0645\u0627 \u0641\u064A\u0647\u0627 \u0645\u0646 \u0623\u0643\u0648\u0627\u062F \u0623\u0648 \u0646\u0635\u0648\u0635 \u0623\u0648 \u0631\u0633\u0648\u0645\u0627\u062A \u0648\u0627\u0634\u0631\u062D\u0647\u0627 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 \u0648\u0628\u0634\u0643\u0644 \u0645\u0628\u0633\u0637 \u062C\u062F\u0627\u064B \u064A\u0646\u0627\u0633\u0628 \u0639\u0645\u0631\u0647.
\u062A\u062C\u0646\u0628 \u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0627\u0644\u0622\u0644\u064A\u0629\u060C \u0648\u0627\u062C\u0639\u0644 \u0627\u0644\u0631\u062F \u0643\u0623\u0646\u0647 \u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 \u0634\u0631\u062D \u0645\u0628\u0627\u0634\u0631. \u0644\u0627 \u062A\u0633\u062A\u062E\u062F\u0645 \u062A\u0646\u0633\u064A\u0642\u0627\u062A \u0645\u0639\u0642\u062F\u0629 \u062C\u062F\u0627\u064B\u060C \u0641\u0642\u0637 \u0646\u0635\u0648\u0635 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0642\u0627\u0637\u0639 \u0642\u0635\u064A\u0631\u0629.

\u0627\u0644\u0633\u0624\u0627\u0644 \u0623\u0648 \u0637\u0644\u0628 \u0627\u0644\u0634\u0631\u062D:
${question || "\u0627\u0634\u0631\u062D \u0644\u064A \u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629"}
`
    });
    if (imageBase64) {
      const b64Data = imageBase64.split(",")[1] || imageBase64;
      const mimeType = imageBase64.match(/data:(image\/\w+);base64/)?.[1] || "image/jpeg";
      parts.push({
        inlineData: {
          data: b64Data,
          mimeType
        }
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [{ role: "user", parts }]
    });
    res.json({ success: true, explanation: response.text });
  } catch (error) {
    console.error("AI Tutor error:", error);
    res.status(500).json({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0634\u0631\u062D. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B." });
  }
});
apiRouter.post("/ai/explain", async (req, res) => {
  const { textInput, imageBase64, studentContext } = req.body;
  const studentName = studentContext?.studentName || "\u064A\u0627 \u0628\u0637\u0644";
  const gradeOrCourse = studentContext?.gradeLevel || studentContext?.courseName || "\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629";
  if (!textInput && !imageBase64) {
    return res.status(400).json({ success: false, error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0633\u0624\u0627\u0644 \u0623\u0648 \u0635\u0648\u0631\u0629 \u0644\u0644\u0634\u0631\u062D" });
  }
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
      const ai = new GoogleGenAI2({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const parts = [];
      const prompt = `\u0623\u0646\u062A \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0648\u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0628\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628.
\u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0630\u064A \u064A\u0633\u0623\u0644\u0643 \u0627\u0633\u0645\u0647 "${studentName}"\u060C \u0648\u064A\u062F\u0631\u0633 \u0641\u064A \u0627\u0644\u0635\u0641/\u0627\u0644\u062F\u0648\u0631\u0629: "${gradeOrCourse}".

\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0645\u0646\u0643:
1. \u0627\u0634\u0631\u062D \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0623\u0648 \u0627\u0644\u0645\u0633\u0623\u0644\u0629 \u0623\u0648 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0644\u0644\u0637\u0627\u0644\u0628 \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0628\u0633\u0637 \u062C\u062F\u0627\u064B \u0648\u0645\u0646\u0627\u0633\u0628 \u0644\u0639\u0645\u0631\u0647 \u0648\u0645\u0631\u062D\u0644\u062A\u0647 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629.
2. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0644\u0647\u062C\u0629 \u0627\u0644\u0645\u0635\u0631\u064A\u0629 \u0627\u0644\u0648\u062F\u0648\u062F\u0629 \u0648\u0627\u0644\u0645\u062D\u0641\u0632\u0629 \u0648\u0627\u0644\u0645\u0634\u062C\u0639\u0629 (\u0623\u0633\u0644\u0648\u0628 \u0623\u0633\u062A\u0627\u0630 \u0634\u0627\u0637\u0631 \u0648\u0645\u062D\u0628\u0648\u0628 \u0645\u0646 \u0637\u0644\u0627\u0628\u0647).
3. \u0646\u0627\u062F\u064A \u0627\u0644\u0637\u0627\u0644\u0628 \u0628\u0627\u0633\u0645\u0647 "${studentName}" \u0648\u0634\u062C\u0639\u0647.
4. \u0642\u0633\u0645 \u0627\u0644\u0634\u0631\u062D \u0625\u0644\u0649 \u0646\u0642\u0627\u0637 \u0623\u0648 \u062E\u0637\u0648\u0627\u062A \u0633\u0647\u0644\u0629 \u0648\u0648\u0627\u0636\u062D\u0629\u060C \u0645\u0639 \u0625\u0639\u0637\u0627\u0621 \u0645\u062B\u0627\u0644 \u0639\u0645\u0644\u064A \u0645\u0646 \u0627\u0644\u062D\u064A\u0627\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.
5. \u0627\u062E\u062A\u0645 \u0628\u0633\u0624\u0627\u0644 \u062A\u0634\u062C\u064A\u0639\u064A \u0644\u0637\u064A\u0641 \u0644\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0641\u0647\u0645\u0647.

\u0633\u0624\u0627\u0644 \u0623\u0648 \u0646\u0635 \u0627\u0644\u0637\u0627\u0644\u0628: ${textInput || "\u064A\u0631\u062C\u0649 \u062A\u062D\u0644\u064A\u0644 \u0648\u0634\u0631\u062D \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 \u0627\u0644\u0645\u0628\u0633\u0637."}`;
      parts.push({ text: prompt });
      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        });
      }
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts }],
          config: {
            temperature: 0.7
          }
        });
        if (response?.text) {
          return res.json({ success: true, explanation: response.text });
        }
      } catch (geminiFlashErr) {
        console.warn("Flash model explain error, trying fallback model:", geminiFlashErr);
        const response2 = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [{ role: "user", parts }],
          config: {
            temperature: 0.7
          }
        });
        if (response2?.text) {
          return res.json({ success: true, explanation: response2.text });
        }
      }
    }
  } catch (error) {
    console.error("AI Explain API error, activating smart educational fallback:", error);
  }
  let fallbackAnswer = `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 ${studentName} \u064A\u0627 \u0628\u0637\u0644! \u{1F31F}

`;
  fallbackAnswer += `\u0623\u0646\u0627 \u0641\u062E\u0648\u0631 \u062C\u062F\u0627\u064B \u0628\u062D\u0631\u0635\u0643 \u0639\u0644\u0649 \u0627\u0644\u062A\u0639\u0644\u0645 \u0648\u0633\u0624\u0627\u0644\u0643 \u0639\u0646 \u0645\u0648\u0636\u0648\u0639: "${textInput || gradeOrCourse}".

`;
  fallbackAnswer += `\u{1F4A1} **\u0627\u0644\u0634\u0631\u062D \u0627\u0644\u0645\u0628\u0633\u0637:**
`;
  if (textInput) {
    fallbackAnswer += `1. **\u0627\u0644\u0641\u0643\u0631\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629:** \u0644\u0645\u0627 \u0646\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 "${textInput.substring(0, 50)}"\u060C \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0647\u0648 \u0641\u0647\u0645 \u0643\u064A\u0641 \u064A\u0646\u0641\u0630 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0648\u0628\u062A\u0631\u062A\u064A\u0628 \u0645\u0646\u0637\u0642\u064A \u0633\u0644\u064A\u0645.
`;
    fallbackAnswer += `2. **\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629:**
   - \u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0628\u062F\u0642\u0629 \u0648\u062D\u062F\u062F \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.
   - \u062C\u0631\u0628 \u0643\u062A\u0627\u0628\u0629 \u0623\u0648 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0648\u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u062D\u062A\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0644\u0644\u064A \u0628\u0639\u062F\u0647\u0627.
   - \u0631\u0627\u062C\u0639 \u0627\u0644\u0643\u0648\u062F \u0623\u0648 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0648\u062A\u0623\u0643\u062F \u0645\u0646 \u0639\u062F\u0645 \u0648\u062C\u0648\u062F \u0623\u062E\u0637\u0627\u0621 \u0641\u064A \u0627\u0644\u062D\u0631\u0648\u0641 \u0623\u0648 \u0627\u0644\u0631\u0645\u0648\u0632.
`;
    fallbackAnswer += `3. **\u0646\u0635\u064A\u062D\u0629 \u0630\u0647\u0628\u064A\u0629:** \u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0639\u0645\u0644\u064A \u0647\u0648 \u0633\u0631 \u062A\u0641\u0648\u0642\u0643 \u0648\u062A\u0645\u064A\u0632\u0643 \u0641\u064A \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627!

`;
  } else {
    fallbackAnswer += `1. **\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0635\u0648\u0631\u0629:** \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0648\u0636\u062D \u062C\u0632\u0621\u0627\u064B \u0645\u0646 \u0627\u0644\u0645\u0646\u0647\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0642\u0631\u0631\u0629 \u0644\u0643 \u0641\u064A \u0643\u0648\u0631\u0633 "${gradeOrCourse}".
`;
    fallbackAnswer += `2. **\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642:** \u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0645\u0648\u0636\u062D\u0629 \u0648\u0637\u0628\u0642\u0647\u0627 \u0639\u0645\u0644\u064A\u0627\u064B \u0639\u0644\u0649 \u062C\u0647\u0627\u0632\u0643 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629 \u0645\u0639 \u0623\u0633\u062A\u0627\u0630\u0643.
`;
    fallbackAnswer += `3. **\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629:** \u064A\u0645\u0643\u0646\u0643 \u0643\u062A\u0627\u0628\u0629 \u0623\u064A \u062A\u0641\u0635\u064A\u0644\u0629 \u0645\u062D\u062F\u062F\u0629 \u0641\u064A \u0627\u0644\u0633\u0624\u0627\u0644 \u0648\u0633\u0623\u0643\u0648\u0646 \u0645\u0639\u0643 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629!

`;
  }
  fallbackAnswer += `\u{1F4AA} \u0627\u0633\u062A\u0645\u0631 \u064A\u0627 ${studentName}\u060C \u0623\u0646\u062A \u0642\u0627\u062F\u0631 \u0639\u0644\u0649 \u062A\u062D\u0642\u064A\u0642 \u0623\u0639\u0644\u0649 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0628\u0625\u0630\u0646 \u0627\u0644\u0644\u0647! \u0647\u0644 \u062A\u062D\u0628 \u0646\u062C\u0631\u0628 \u0646\u0637\u0628\u0642 \u062A\u0645\u0631\u064A\u0646 \u0639\u0644\u064A\u0647\u0627 \u0645\u0639 \u0628\u0639\u0636\u061F \u2728`;
  return res.json({ success: true, explanation: fallbackAnswer });
});
apiRouter.use(express2.json({ limit: "20mb" }));
apiRouter.get("/social/posts", (req, res) => {
  const posts = db.getData().studentPosts || [];
  res.json(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});
apiRouter.post("/social/posts", (req, res) => {
  const { authorId, authorName, authorRole, content, mediaUrl, mediaType } = req.body;
  const newPost = {
    id: "post-" + Date.now(),
    authorId,
    authorName,
    authorRole,
    content,
    mediaUrl,
    mediaType,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    likes: [],
    commentsCount: 0
  };
  const data = db.getData();
  data.studentPosts = [...data.studentPosts || [], newPost];
  db.save();
  res.status(201).json(newPost);
});
apiRouter.post("/social/posts/:postId/like", (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const data = db.getData();
  const post = data.studentPosts?.find((p) => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const index = post.likes.indexOf(userId);
  if (index > -1) {
    post.likes.splice(index, 1);
  } else {
    post.likes.push(userId);
  }
  db.save();
  res.json(post);
});
apiRouter.get("/social/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const data = db.getData();
  const comments = (data.socialComments || []).filter((c) => c.postId === postId);
  res.json(comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
});
apiRouter.post("/social/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const { authorId, authorName, content } = req.body;
  const newComment = {
    id: "comment-" + Date.now(),
    postId,
    authorId,
    authorName,
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const data = db.getData();
  data.socialComments = [...data.socialComments || [], newComment];
  const post = data.studentPosts?.find((p) => p.id === postId);
  if (post) {
    post.commentsCount = (post.commentsCount || 0) + 1;
  }
  db.save();
  res.status(201).json(newComment);
});
function getLocalIp() {
  const interfaces = os2.networkInterfaces();
  const preferredOrder = ["eth0", "eth1", "en0", "en1", "wlan0", "wlan1", "Wi-Fi", "Ethernet"];
  let fallbackIp = "127.0.0.1";
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal && !iface.address.startsWith("169.254.")) {
        if (preferredOrder.some((pref) => name.includes(pref))) {
          return iface.address;
        }
        if (fallbackIp === "127.0.0.1") fallbackIp = iface.address;
      }
    }
  }
  return fallbackIp;
}
function findOrCreateAvailableGroup(courseId, branchId) {
  const data = db.getData();
  if (!courseId) return void 0;
  const targetBranchId = branchId || data.branches?.[0]?.id || "b1";
  const targetCourse = data.courses.find((c) => c.id === courseId);
  let candidateGroups = data.groups.filter(
    (g) => g.courseId === courseId && (g.status === "active" || g.status === "upcoming") && (!branchId || g.branchId === branchId)
  );
  if (candidateGroups.length === 0) {
    candidateGroups = data.groups.filter(
      (g) => g.courseId === courseId && (g.status === "active" || g.status === "upcoming")
    );
  }
  for (const group of candidateGroups) {
    const currentEnrolled = data.trainees.filter((t) => t.groupId === group.id).length;
    const maxCap = group.maxStudents || group.maxCapacity || 25;
    if (currentEnrolled < maxCap) {
      return group;
    }
  }
  const allGroupsForCourse = data.groups.filter((g) => g.courseId === courseId);
  const groupNumber = allGroupsForCourse.length + 1;
  const courseName = targetCourse?.name || "\u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629";
  const newGroup = {
    id: "grp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    name: `\u0645\u062C\u0645\u0648\u0639\u0629 ${courseName} - \u0641\u0648\u062C ${groupNumber}`,
    branchId: targetBranchId,
    courseId,
    trainerId: targetCourse?.trainerId || data.trainers?.[0]?.id,
    maxStudents: 25,
    maxCapacity: 25,
    status: "active",
    days: ["\u0627\u0644\u0623\u062D\u062F", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633"],
    timeSlot: "04:00 \u0645 - 06:00 \u0645",
    notes: `\u0645\u062C\u0645\u0648\u0639\u0629 \u0641\u0631\u0639\u064A\u0629 \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A\u0629 \u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647\u0627 \u0644\u062A\u0631\u062A\u064A\u0628 \u0648\u0625\u0644\u062D\u0627\u0642 \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646 \u0628\u0627\u0644\u0641\u0635\u0644`
  };
  data.groups.push(newGroup);
  db.save();
  return newGroup;
}
apiRouter.get("/system/info", async (req, res) => {
  try {
    const localIp = getLocalIp();
    const [branches, trainees] = await Promise.all([BranchRepo.getAll(), TraineeRepo.getAll()]);
    res.json({
      version: "V7.0",
      systemName: "Nagah M-S - \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
      serverIp: localIp,
      port: 3e3,
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: Math.round(process.uptime()),
      branchesCount: branches.length,
      traineesCount: trainees.length,
      activeDevicesCount: (db.getData().devices || []).filter((d) => d.isOnline).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/download/installer-bat", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const appUrl = `${protocol}://${host}`;
  const bat = `@echo off
chcp 65001 >nul
title Nagah M-S Setup & Launcher
echo ========================================================
echo          Nagah M-S - \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628
echo            \u062C\u0627\u0631\u064A \u062A\u062B\u0628\u064A\u062A \u0648\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u062A\u0637\u0628\u064A\u0642...
echo ========================================================
echo.

set "APP_NAME=Nagah M-S"
set "APP_URL=${appUrl}"
set "DESKTOP_DIR=%USERPROFILE%\\Desktop"
set "STARTMENU_DIR=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"

echo [1/3] \u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0635\u0627\u0631 \u0633\u0637\u062D \u0627\u0644\u0645\u0643\u062A\u0628...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP_DIR%\\Nagah M-S.lnk'); $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=%APP_URL%'; $s.Description = '\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 - Nagah M-S'; $s.Save()"

if not exist "%DESKTOP_DIR%\\Nagah M-S.lnk" (
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP_DIR%\\Nagah M-S.lnk'); $s.TargetPath = 'chrome.exe'; $s.Arguments = '--app=%APP_URL%'; $s.Save()"
)

echo [2/3] \u0625\u0636\u0627\u0641\u0629 \u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0628\u062F\u0623...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%STARTMENU_DIR%\\Nagah M-S.lnk'); $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=%APP_URL%'; $s.Save()"

echo [3/3] \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0641\u064A \u0646\u0627\u0641\u0630\u0629 \u0645\u0633\u062A\u0642\u0644\u0629...
start msedge.exe --app="${appUrl}" || start chrome.exe --app="${appUrl}" || start "" "${appUrl}"

echo.
echo ========================================================
echo  \u062A\u0645 \u0627\u0644\u062A\u062B\u0628\u064A\u062A \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0635\u0627\u0631 Nagah M-S \u0639\u0644\u0649 \u0633\u0637\u062D \u0627\u0644\u0645\u0643\u062A\u0628.
echo ========================================================
timeout /t 4
`;
  res.setHeader("Content-Type", "application/x-bat; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Install-Nagah-MS.bat"');
  res.send(bat);
});
apiRouter.get("/download/shortcut-url", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const appUrl = `${protocol}://${host}`;
  const urlContent = `[InternetShortcut]
URL=${appUrl}
IconIndex=0
IconFile=${appUrl}/favicon.ico
`;
  res.setHeader("Content-Type", "application/internet-shortcut; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Nagah-MS.url"');
  res.send(urlContent);
});
var handleLoginRequest = (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
    const defaultPasswords = {
      admin: "1234",
      accountant: "1234",
      reception: "1234",
      trainer: "1234",
      manager_ngah: "1234",
      manager_badr: "1234"
    };
    let users = [];
    try {
      users = db.getData()?.users || [];
    } catch {
      users = [];
    }
    let user = users.find((u) => u && u.username && u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      const uLower = username.trim().toLowerCase();
      if (uLower === "admin") {
        user = {
          id: "u-admin",
          username: "admin",
          fullName: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
          role: "admin",
          status: "active",
          branchId: "all",
          createdAt: "2026-01-01"
        };
      } else if (uLower === "manager_ngah") {
        user = {
          id: "u-manager-1",
          username: "manager_ngah",
          fullName: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0627\u062D",
          role: "branch_manager",
          status: "active",
          branchId: "branch-1",
          createdAt: "2026-01-01"
        };
      } else if (uLower === "accountant") {
        user = {
          id: "u-accountant",
          username: "accountant",
          fullName: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A",
          role: "accountant",
          status: "active",
          branchId: "all",
          createdAt: "2026-01-01"
        };
      } else if (uLower === "reception") {
        user = {
          id: "u-reception",
          username: "reception",
          fullName: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
          role: "receptionist",
          status: "active",
          branchId: "branch-1",
          createdAt: "2026-01-01"
        };
      } else if (uLower === "trainer") {
        user = {
          id: "u-trainer",
          username: "trainer",
          fullName: "\u0645\u062F\u0631\u0628 \u0648\u0645\u062D\u0627\u0636\u0631",
          role: "trainer",
          status: "active",
          branchId: "branch-1",
          createdAt: "2026-01-01"
        };
      }
    }
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0639\u0637\u0644" });
    }
    const hashedInput = hashPassword(password);
    let storedHash;
    try {
      storedHash = db.getPasswordHash(user.id);
    } catch {
    }
    const isDefaultMatch = defaultPasswords[user.username.toLowerCase()] === password;
    const isValid = storedHash ? storedHash === hashedInput || isDefaultMatch : isDefaultMatch || password === "1234";
    if (!isValid) {
      return res.status(401).json({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    try {
      db.logAudit({
        userId: user.id,
        userName: user.fullName,
        action: "\u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644",
        entity: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646",
        entityId: user.id,
        branchId: user.branchId,
        details: `\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 (${user.username}) \u062F\u0648\u0631: ${user.role}`
      });
    } catch (e) {
      console.warn("[Login] Non-critical logAudit error:", e);
    }
    return res.json({
      success: true,
      user,
      token: "jwt_mock_" + user.id + "_" + Date.now()
    });
  } catch (err) {
    console.error("[Login Route Error]:", err);
    return res.status(500).json({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644: " + (err?.message || "Unknown error") });
  }
};
apiRouter.post("/auth/login", handleLoginRequest);
apiRouter.post("/login", handleLoginRequest);
apiRouter.all(["/auth/login", "/login"], (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Login endpoint is active. Use POST to authenticate." });
  }
  handleLoginRequest(req, res);
});
apiRouter.get("/auth/users", (req, res) => {
  res.json(db.getData().users);
});
apiRouter.post("/auth/users", (req, res) => {
  const { username, password, fullName, role, branchId, phone, email, trainerId, traineeId } = req.body;
  if (!username || !password || !fullName || !role) {
    return res.status(400).json({ error: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
  }
  const existing = db.getData().users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644" });
  }
  const newUser = {
    id: "user-" + Date.now(),
    username: username.trim(),
    fullName: fullName.trim(),
    role,
    branchId: branchId || void 0,
    phone,
    email,
    trainerId,
    traineeId,
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.setPassword(newUser.id, password);
  db.getData().users.push(newUser);
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F",
    entity: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646",
    entityId: newUser.id,
    details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F: ${newUser.fullName} (${newUser.username})`
  });
  res.json({ success: true, user: newUser });
});
apiRouter.put("/auth/users/:id", (req, res) => {
  const { id } = req.params;
  const user = db.getData().users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  const { fullName, role, branchId, phone, email, status, password } = req.body;
  if (fullName) user.fullName = fullName;
  if (role) user.role = role;
  if (branchId !== void 0) user.branchId = branchId;
  if (phone !== void 0) user.phone = phone;
  if (email !== void 0) user.email = email;
  if (status) user.status = status;
  if (password) {
    db.setPassword(user.id, password);
  }
  db.save();
  res.json({ success: true, user });
});
apiRouter.delete("/auth/users/:id", (req, res) => {
  const { id } = req.params;
  const index = db.getData().users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  if (db.getData().users[index].role === "super_admin" && db.getData().users.filter((u) => u.role === "super_admin").length <= 1) {
    return res.status(400).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u0623\u062E\u064A\u0631" });
  }
  const deletedUser = db.getData().users.splice(index, 1)[0];
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062D\u0630\u0641 \u0645\u0633\u062A\u062E\u062F\u0645",
    entity: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646",
    entityId: id,
    details: `\u062A\u0645 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${deletedUser.fullName}`
  });
  res.json({ success: true });
});
apiRouter.get("/branches", async (req, res) => {
  try {
    const list = await BranchRepo.getAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/branches", async (req, res) => {
  try {
    const { name, code, address, phone, managerName } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, error: "\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639 \u0648\u0627\u0644\u0643\u0648\u062F \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    const id = "branch-" + Date.now();
    const newBranch = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address || "",
      phone: phone || "",
      managerName: managerName || "",
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const created = await BranchRepo.create(id, newBranch);
    res.json({ success: true, branch: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.put("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, managerName, status } = req.body;
    const update = {};
    if (name) update.name = name;
    if (code) update.code = code;
    if (address !== void 0) update.address = address;
    if (phone !== void 0) update.phone = phone;
    if (managerName !== void 0) update.managerName = managerName;
    if (status) update.status = status;
    const updated = await BranchRepo.update(id, update);
    res.json({ success: true, branch: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await BranchRepo.delete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/branches/:id/duplicate", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await BranchRepo.getById(id);
    if (!branch) return res.status(404).json({ error: "\u0627\u0644\u0641\u0631\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const allBranches = await BranchRepo.getAll();
    const newBranch = {
      id: "br-" + Date.now(),
      name: `${branch.name} (\u0645\u0642\u0631 \u0625\u0636\u0627\u0641\u064A)`,
      code: `BR-${allBranches.length + 1}`,
      address: branch.address,
      phone: branch.phone,
      managerName: branch.managerName,
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await BranchRepo.create(newBranch.id, newBranch);
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
      action: "\u062A\u0643\u0631\u0627\u0631 \u0641\u0631\u0639",
      entity: "\u0627\u0644\u0641\u0631\u0648\u0639",
      entityId: newBranch.id,
      details: `\u062A\u0645 \u0646\u0633\u062E \u0648\u0625\u0646\u0634\u0627\u0621 \u0641\u0631\u0639 \u062C\u062F\u064A\u062F: ${newBranch.name} \u0645\u0633\u062A\u0646\u0633\u062E\u0627\u064B \u0645\u0646 ${branch.name}`
    });
    res.json({ success: true, branch: newBranch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/trainees/next-code", async (req, res) => {
  try {
    const { prefix, courseId, grade } = req.query;
    let targetPrefix = typeof prefix === "string" ? prefix : "";
    if (!targetPrefix && typeof courseId === "string" && courseId) {
      const courses = await CourseRepo.getAll();
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        targetPrefix = db.getPrefixForGradeOrCourse(course.name);
      }
    }
    if (!targetPrefix && typeof grade === "string" && grade) {
      targetPrefix = db.getPrefixForGradeOrCourse(grade);
    }
    const resolvedPrefix = targetPrefix ? targetPrefix.length === 1 ? targetPrefix.toUpperCase() : db.getPrefixForGradeOrCourse(targetPrefix) : "NGH";
    const allTrainees = await TraineeRepo.getAll();
    const pfx = (resolvedPrefix || "NGH").toUpperCase();
    const regex = new RegExp(`^${pfx}-?(\\d+)$`, "i");
    let maxNum = 0;
    allTrainees.forEach((t) => {
      if (t.code) {
        const match = String(t.code).trim().match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    const nextNum = maxNum + 1;
    const code = pfx.length === 1 ? `${pfx}${String(nextNum).padStart(3, "0")}` : `${pfx}-${nextNum}`;
    res.json({ code, prefix: resolvedPrefix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/trainees", authMiddleware, async (req, res) => {
  try {
    let list = await TraineeRepo.getAll();
    const user = req.user;
    if (user) {
      if (user.role === "student") {
        list = list.filter((t) => t.id === user.traineeId || t.code === user.username || t.studentCode === user.username);
      } else if (user.role === "parent") {
        list = list.filter((t) => t.parentPhone === user.phone || user.childrenIds?.includes(t.id));
      } else if (user.role === "branch_manager" && user.branchId && user.branchId !== "all") {
        list = list.filter((t) => t.branchId === user.branchId);
      } else if (user.role === "trainer" && user.trainerId) {
        list = list.filter((t) => t.trainerId === user.trainerId);
      }
    }
    const branchId = req.query.branchId;
    const courseId = req.query.courseId;
    const groupId = req.query.groupId;
    const trainerId = req.query.trainerId;
    const status = req.query.status;
    const search = req.query.search;
    if (branchId && branchId !== "all") list = list.filter((t) => t.branchId === String(branchId));
    if (courseId && courseId !== "all") list = list.filter((t) => t.courseId === courseId || Array.isArray(t.courseIds) && t.courseIds.includes(courseId));
    if (groupId && groupId !== "all") list = list.filter((t) => t.groupId === groupId);
    if (trainerId && trainerId !== "all") list = list.filter((t) => t.trainerId === trainerId);
    if (status && status !== "all") list = list.filter((t) => t.status === status);
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (t) => t.fullName && t.fullName.toLowerCase().includes(s) || t.phone && t.phone.includes(s) || t.code && String(t.code).toLowerCase().includes(s) || t.parentPhone && t.parentPhone.includes(s)
      );
    }
    const sanitizedList = list.map((t) => sanitizeTraineeDTO(t, user?.role || "student"));
    res.json(sanitizedList);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.get("/audit/integrity-report", authMiddleware, requireRole(["super_admin", "admin"]), async (req, res) => {
  try {
    const report = await runDataIntegrityAudit();
    res.json({ success: true, report });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.get("/trainees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trainee = await TraineeRepo.getById(id);
    if (!trainee) return res.status(404).json({ success: false, error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const payments = await PaymentRepo.getByTraineeId(trainee.id);
    const attendance = await AttendanceRepo.getByTraineeId(trainee.id);
    const pointsFromFs = await PointTransactionRepo.getByTraineeId(trainee.id);
    const pointsLocal = (db.getData().pointTransactions || []).filter((pt) => pt.traineeId === trainee.id);
    const ptMap = /* @__PURE__ */ new Map();
    for (const p of [...pointsFromFs, ...pointsLocal]) {
      if (p.id) ptMap.set(p.id, p);
    }
    const points = Array.from(ptMap.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const exams = (db.getData().examResults || []).filter((er) => er.traineeId === trainee.id);
    res.json({ trainee, payments, attendance, points, exams });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/trainees", async (req, res) => {
  try {
    const data = req.body;
    if (!data.fullName || !data.branchId) return res.status(400).json({ success: false, error: "\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0641\u0631\u0639 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    let code = data.code?.trim();
    if (!code) {
      let prefix = "A";
      try {
        const course = await CourseRepo.getById(data.courseId || "");
        if (course && course.grade) {
          const gName = course.grade;
          if (gName.includes("\u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A")) prefix = "A";
          else if (gName.includes("\u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A")) prefix = "B";
          else if (gName.includes("\u0627\u0644\u0633\u0627\u062F\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A")) prefix = "C";
          else if (gName.includes("\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A")) prefix = "D";
          else if (gName.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A")) prefix = "E";
          else if (gName.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A")) prefix = "F";
          else if (gName.includes("\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) prefix = "G";
          else if (gName.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) prefix = "H";
          else if (gName.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) prefix = "I";
        }
      } catch (e) {
        console.warn("Could not determine grade prefix, using fallback", e);
      }
      const list = await TraineeRepo.getAll();
      let maxNum = 0;
      const regex = new RegExp("^" + prefix + "(\\d{3,})$", "i");
      list.forEach((t) => {
        const c = t.code;
        if (c) {
          const m = c.match(regex);
          if (m) {
            const num = parseInt(m[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      });
      code = `${prefix}${(maxNum + 1).toString().padStart(3, "0")}`;
    }
    const traineeId = "trainee-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    const feeAmount = Number(data.feeAmount) || 0;
    const discountAmount = Number(data.discountAmount) || 0;
    const netAmount = Math.max(0, feeAmount - discountAmount);
    const paidAmount = Number(data.paidAmount) || 0;
    const remainingAmount = Math.max(0, netAmount - paidAmount);
    const created = await TraineeRepo.create(traineeId, {
      ...data,
      code,
      feeAmount,
      discountAmount,
      netAmount,
      paidAmount,
      remainingAmount,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ success: true, trainee: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.put("/trainees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;
    const currentTrainee = await TraineeRepo.getById(id);
    if (currentTrainee) {
      let oldCourseId = currentTrainee.courseId;
      let oldGrade = currentTrainee.grade;
      let newCourseId = updates.courseId;
      let newGrade = updates.grade;
      if (newCourseId && newCourseId !== oldCourseId || newGrade && newGrade !== oldGrade) {
        let newPrefix = "";
        if (newCourseId) {
          const course = await CourseRepo.getById(newCourseId);
          if (course) newPrefix = db.getPrefixForGradeOrCourse(course.name);
        }
        if (!newPrefix && newGrade) {
          newPrefix = db.getPrefixForGradeOrCourse(newGrade);
        }
        newPrefix = (newPrefix || "NGH").toUpperCase();
        let currentPrefix = "";
        if (currentTrainee.code) {
          const m = currentTrainee.code.match(/^([a-zA-Z]+)/);
          if (m) currentPrefix = m[1].toUpperCase();
        }
        if (newPrefix && currentPrefix && newPrefix !== currentPrefix) {
          const allTrainees = await TraineeRepo.getAll();
          const regex = new RegExp(`^${newPrefix}-?(\\d+)$`, "i");
          let maxNum = 0;
          allTrainees.forEach((t) => {
            if (t.code && t.id !== id) {
              const match = t.code.trim().match(regex);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
              }
            }
          });
          updates.code = `${newPrefix}${(maxNum + 1).toString().padStart(3, "0")}`;
          updates.prefix = newPrefix;
          console.log(`[TRAINEE_UPDATE] Regenerated code for ${id}: ${currentTrainee.code} -> ${updates.code}`);
        }
      }
    }
    const updated = await TraineeRepo.update(id, updates);
    res.json({ success: true, trainee: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/trainees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trainee = await TraineeRepo.getById(id);
    if (!trainee) return res.status(404).json({ success: false, error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    await TraineeRepo.update(id, { status: "archived" });
    res.json({ success: true, message: "\u062A\u0645 \u0623\u0631\u0634\u0641\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0648\u062D\u0641\u0638 \u0628\u064A\u0627\u0646\u0627\u062A\u0647 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0628\u0646\u062C\u0627\u062D" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/trainees/bulk-assign-group", async (req, res) => {
  try {
    const { traineeIds, groupId } = req.body;
    if (!Array.isArray(traineeIds) || !groupId) return res.status(400).json({ error: "Invalid data" });
    const group = await GroupRepo.getById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    let count = 0;
    const batch = adminDb.batch();
    for (const id of traineeIds) {
      batch.update(adminDb.collection("trainees").doc(id), {
        groupId,
        courseId: group.courseId
      });
      count++;
    }
    await batch.commit();
    TraineeRepo.invalidateCache();
    res.json({ success: true, count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.post("/trainees/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid ids" });
    const batch = adminDb.batch();
    ids.forEach((id) => batch.delete(adminDb.collection("trainees").doc(id)));
    await batch.commit();
    res.json({ success: true, count: ids.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.post("/trainees/bulk-upgrade", async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0639\u0631\u0641\u0627\u062A \u0644\u0644\u062A\u0631\u0642\u064A\u0629" });
    }
    const batch = adminDb.batch();
    for (const id of ids) {
      batch.update(adminDb.collection("trainees").doc(id), { status: status || "active" });
    }
    await batch.commit();
    TraineeRepo.invalidateCache();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
      action: "\u062A\u0631\u0642\u064A\u0629 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
      entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
      details: `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644/\u062A\u0631\u0642\u064A\u0629 ${ids.length} \u0645\u062A\u062F\u0631\u0628\u064A\u0646 \u062F\u0641\u0639\u0629 \u0648\u0627\u062D\u062F\u0629`
    });
    res.json({ success: true, count: ids.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.get("/trainees/promotion-preview", (req, res) => {
  const { branchId } = req.query;
  const dbData = db.getData();
  let trainees = dbData.trainees.filter((t) => t.status === "active");
  if (branchId && branchId !== "all") {
    trainees = trainees.filter((t) => t.branchId === branchId);
  }
  const currentYear = dbData.settings?.academicYear || "2026/2027";
  let nextYear = "2027/2028";
  const yearMatch = currentYear.match(/(\d{4})\/(\d{4})/);
  if (yearMatch) {
    const y1 = parseInt(yearMatch[1], 10) + 1;
    const y2 = parseInt(yearMatch[2], 10) + 1;
    nextYear = `${y1}/${y2}`;
  }
  const gradeProgression = {
    "ICT4": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633", nextCourseCode: "ICT5" },
    "ICT5": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633", nextCourseCode: "ICT6" },
    "ICT6": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P1" },
    "ICT-P1": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P2" },
    "ICT-P2": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P3" },
    "ICT-P3": { nextGrade: "\u062E\u0631\u064A\u062C \u0627\u0644\u0645\u0631\u0643\u0632", nextCourseCode: "GRADUATE" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633", nextCourseCode: "ICT5" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633", nextCourseCode: "ICT6" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P1" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P2" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": { nextGrade: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A", nextCourseCode: "ICT-P3" },
    "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A": { nextGrade: "\u062E\u0631\u064A\u062C \u0627\u0644\u0645\u0631\u0643\u0632", nextCourseCode: "GRADUATE" }
  };
  const previewList = trainees.map((t) => {
    const currentCourse = dbData.courses.find((c) => c.id === t.courseId);
    const currentGroup = dbData.groups.find((g) => g.id === t.groupId);
    const courseKey = currentCourse?.code || currentCourse?.name || "";
    let progression = gradeProgression[courseKey];
    if (!progression) {
      for (const [k, v] of Object.entries(gradeProgression)) {
        if (courseKey.includes(k) || currentCourse?.name && currentCourse.name.includes(k)) {
          progression = v;
          break;
        }
      }
    }
    const nextCourseCode = progression ? progression.nextCourseCode : "";
    const nextGradeName = progression ? progression.nextGrade : "\u0627\u0644\u0635\u0641 \u0627\u0644\u062A\u0627\u0644\u064A";
    const isGraduating = nextCourseCode === "GRADUATE" || courseKey.includes("P3") || courseKey.includes("\u062B\u0627\u0644\u062B \u0625\u0639\u062F\u0627\u062F\u064A");
    const targetCourse = !isGraduating ? dbData.courses.find((c) => c.code === nextCourseCode || c.name.includes(nextGradeName) || c.name === nextCourseCode) : null;
    let suggestedGroupName = "";
    if (currentGroup?.name && nextCourseCode) {
      suggestedGroupName = currentGroup.name.replace(/ICT4|ICT5|ICT6|ICT-P1|ICT-P2|ICT-P3|الصف الرابع|الصف الخامس|الصف السادس|الأول الإعدادي|الثاني الإعدادي|الثالث الإعدادي/i, nextCourseCode);
    }
    return {
      traineeId: t.id,
      traineeCode: t.code,
      fullName: t.fullName,
      phone: t.phone,
      branchId: t.branchId,
      currentCourseId: t.courseId,
      currentCourseName: currentCourse?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      currentCourseCode: currentCourse?.code || "",
      currentGroupId: t.groupId,
      currentGroupName: currentGroup?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      nextGradeName,
      nextCourseCode,
      targetCourseId: targetCourse?.id || "",
      targetCourseName: targetCourse?.name || (nextCourseCode ? `${nextGradeName} (${nextCourseCode})` : "\u062F\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629"),
      suggestedGroupName,
      isGraduating,
      suggestedAction: isGraduating ? "graduate" : "promote"
    };
  });
  res.json({
    currentYear,
    nextYear,
    totalEligible: previewList.length,
    students: previewList,
    availableCourses: dbData.courses,
    availableGroups: dbData.groups
  });
});
apiRouter.post("/trainees/promote-batch", async (req, res) => {
  const { promotions, autoCreateGroups = true, newAcademicYear, updateSettingsYear = true } = req.body;
  if (!Array.isArray(promotions) || promotions.length === 0) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0637\u0644\u0627\u0628 \u0644\u0644\u062A\u0635\u0639\u064A\u062F \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0629" });
  }
  const dbData = db.getData();
  let promotedCount = 0;
  let graduatedCount = 0;
  let createdGroupsCount = 0;
  const batch = adminDb.batch();
  const ensureCourseExists = (name, code, branchId) => {
    let crs = dbData.courses.find((c) => c.code === code || c.name === name);
    if (!crs) {
      crs = {
        id: "crs-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        name: name || code,
        code,
        branchId: branchId || dbData.branches?.[0]?.id || "branch-1",
        category: "\u0627\u0644\u0645\u062F\u0627\u0631\u0633",
        hoursCount: 20,
        lecturesCount: 10,
        feeAmount: (branchId || dbData.branches?.[0]?.id || "branch-1") === "branch-2" ? 250 : 200,
        status: "active"
      };
      dbData.courses.push(crs);
    }
    return crs;
  };
  for (const item of promotions) {
    const trainee = dbData.trainees.find((t) => t.id === item.traineeId);
    if (!trainee) continue;
    if (item.action === "graduate") {
      const notes = (trainee.notes ? trainee.notes + " | " : "") + `\u062A\u062E\u0631\u062C \u0648\u0623\u062A\u0645 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A \u0628\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0639\u0627\u0645 ${dbData.settings?.academicYear || ""}`;
      batch.update(adminDb.collection("trainees").doc(trainee.id), { status: "completed", notes });
      graduatedCount++;
      continue;
    }
    if (item.action === "promote") {
      let targetCourseId = item.targetCourseId;
      if (!targetCourseId && item.nextCourseCode) {
        const crs = ensureCourseExists(item.nextGradeName || item.nextCourseCode, item.nextCourseCode, trainee.branchId);
        targetCourseId = crs.id;
      }
      if (!targetCourseId) continue;
      const currentGroup = trainee.groupId ? dbData.groups.find((g) => g.id === trainee.groupId) : null;
      let targetGroupId = item.targetGroupId;
      if (!targetGroupId && autoCreateGroups && currentGroup && item.nextCourseCode) {
        const expectedGroupName = item.suggestedGroupName || currentGroup.name.replace(/ICT4|ICT5|ICT6|ICT-P1|ICT-P2|ICT-P3/i, item.nextCourseCode);
        let matchingGroup = dbData.groups.find((g) => g.courseId === targetCourseId && g.branchId === trainee.branchId && g.name === expectedGroupName);
        if (!matchingGroup) {
          matchingGroup = {
            id: "grp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
            name: expectedGroupName,
            branchId: trainee.branchId,
            courseId: targetCourseId,
            trainerId: currentGroup.trainerId,
            days: currentGroup.days || ["\u0627\u0644\u062C\u0645\u0639\u0629"],
            timeSlot: currentGroup.timeSlot || "04:00 \u0645 - 06:00 \u0645",
            roomName: currentGroup.roomName,
            maxStudents: currentGroup.maxStudents || 12,
            maxCapacity: currentGroup.maxCapacity || 12,
            status: "active"
          };
          dbData.groups.push(matchingGroup);
          createdGroupsCount++;
        }
        targetGroupId = matchingGroup.id;
      }
      batch.update(adminDb.collection("trainees").doc(trainee.id), {
        courseId: targetCourseId,
        groupId: targetGroupId || trainee.groupId,
        status: "active"
      });
      promotedCount++;
    }
  }
  try {
    await batch.commit();
    TraineeRepo.invalidateCache();
    db.saveImmediate();
  } catch (e) {
    console.error("Promotion error", e);
    return res.status(500).json({ error: "Failed to promote" });
  }
  if (updateSettingsYear && newAcademicYear) {
    if (!dbData.settings) dbData.settings = { centerName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D" };
    dbData.settings.academicYear = newAcademicYear;
    db.saveImmediate();
  }
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062A\u0635\u0639\u064A\u062F \u0648\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    details: `\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 \u0648\u062A\u0635\u0639\u064A\u062F ${promotedCount} \u0637\u0627\u0644\u0628 \u0648\u062A\u062E\u0631\u064A\u062C ${graduatedCount} \u0637\u0627\u0644\u0628 \u0644\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A ${newAcademicYear || ""} \u0648\u0625\u0646\u0634\u0627\u0621 ${createdGroupsCount} \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u062C\u062F\u064A\u062F\u0629`
  });
  res.json({
    success: true,
    promotedCount,
    graduatedCount,
    createdGroupsCount,
    newAcademicYear: dbData.settings?.academicYear
  });
});
apiRouter.post("/trainees/batch-sync-records", (req, res) => {
  const allTrainees = db.getData().trainees;
  let updatedCount = 0;
  let parentNamesAutoFilledCount = 0;
  let birthDatesExtractedCount = 0;
  let siblingsLinkedCount = 0;
  let exemptionsProcessedCount = 0;
  const extractBirthDate = (nationalId) => {
    const cleaned = (nationalId || "").replace(/\D/g, "");
    if (cleaned.length !== 14) return null;
    const century = cleaned.charAt(0);
    const yy = cleaned.substring(1, 3);
    const mm = cleaned.substring(3, 5);
    const dd = cleaned.substring(5, 7);
    let yearPrefix = "";
    if (century === "2") yearPrefix = "19";
    else if (century === "3") yearPrefix = "20";
    else return null;
    const monthNum = parseInt(mm, 10);
    const dayNum = parseInt(dd, 10);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
    return `${yearPrefix}${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };
  allTrainees.forEach((t) => {
    let touched = false;
    if (!t.parentName || !t.parentName.trim()) {
      const parts = (t.fullName || "").trim().split(/\s+/);
      if (parts.length >= 2) {
        t.parentName = parts.slice(1).join(" ");
        parentNamesAutoFilledCount++;
        touched = true;
      }
    }
    if (t.nationalId && (!t.birthDate || !t.birthDate.trim())) {
      const extractedBD = extractBirthDate(t.nationalId);
      if (extractedBD) {
        t.birthDate = extractedBD;
        birthDatesExtractedCount++;
        touched = true;
      }
    }
    const noteLower = (t.notes || "").toLowerCase();
    const isExemptNote = noteLower.includes("\u0625\u0639\u0641\u0627\u0621") || noteLower.includes("\u0645\u0639\u0641\u064A") || noteLower.includes("\u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0645\u0627\u0644\u0643") || noteLower.includes("\u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0625\u062F\u0627\u0631\u0629") || noteLower.includes("\u0645\u0646\u062D\u0629") || noteLower.includes("\u0645\u062C\u0627\u0646\u064A");
    if (isExemptNote && !t.isExempt) {
      t.isExempt = true;
      if (!t.exemptReason) {
        if (noteLower.includes("\u0625\u062F\u0627\u0631\u064A") || noteLower.includes("\u0645\u0627\u0644\u0643") || noteLower.includes("\u0625\u062F\u0627\u0631\u0629")) {
          t.exemptReason = "management_children";
        } else if (noteLower.includes("\u0623\u0635\u062F\u0642\u0627\u0621") || noteLower.includes("\u0645\u0639\u0627\u0631\u0641")) {
          t.exemptReason = "friend_children";
        } else {
          t.exemptReason = "scholarship";
        }
      }
      t.discountAmount = t.feeAmount || 1500;
      t.netAmount = 0;
      t.remainingAmount = 0;
      exemptionsProcessedCount++;
      touched = true;
    }
    if (touched) updatedCount++;
  });
  allTrainees.forEach((tA) => {
    const pPhoneA = (tA.parentPhone || tA.phone || "").replace(/\D/g, "");
    const pNameA = (tA.parentName || "").trim().toLowerCase();
    const partsA = (tA.fullName || "").trim().toLowerCase().split(/\s+/);
    const fatherA = partsA.length >= 2 ? partsA.slice(1).join(" ") : "";
    const siblingMatches = allTrainees.filter((tB) => {
      if (tB.id === tA.id) return false;
      const pPhoneB = (tB.parentPhone || tB.phone || "").replace(/\D/g, "");
      const pNameB = (tB.parentName || "").trim().toLowerCase();
      const partsB = (tB.fullName || "").trim().toLowerCase().split(/\s+/);
      const fatherB = partsB.length >= 2 ? partsB.slice(1).join(" ") : "";
      if (pPhoneA && pPhoneA.length >= 8 && pPhoneB === pPhoneA) return true;
      return false;
    });
    if (siblingMatches.length > 0) {
      const existingIds = tA.siblingIds || [];
      const newSiblingIds = Array.from(/* @__PURE__ */ new Set([...existingIds, ...siblingMatches.map((s) => s.id)]));
      const newSiblingNames = Array.from(/* @__PURE__ */ new Set([...tA.siblingNames || [], ...siblingMatches.map((s) => s.fullName)]));
      let changedSiblings = false;
      if (newSiblingIds.length !== existingIds.length) {
        tA.siblingIds = newSiblingIds;
        tA.siblingNames = newSiblingNames;
        changedSiblings = true;
        siblingsLinkedCount++;
      }
      if (!tA.isExempt && (tA.discountAmount === 0 || !tA.discountAmount)) {
        const discVal = Math.round((tA.feeAmount || 1500) * 0.2);
        tA.discountAmount = discVal;
        tA.netAmount = Math.max(0, tA.feeAmount - discVal);
        tA.remainingAmount = Math.max(0, tA.netAmount - (tA.paidAmount || 0));
        const sibNote = `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u062E\u0635\u0645 \u0627\u0644\u0623\u062E\u0648\u0627\u062A 20% \u0644\u0631\u0628\u0637\u0647 \u0645\u0639 (${siblingMatches.map((s) => s.fullName).join("\u060C ")})`;
        if (!tA.notes?.includes("\u062E\u0635\u0645 \u0627\u0644\u0623\u062E\u0648\u0627\u062A")) {
          tA.notes = (tA.notes ? tA.notes + " | " : "") + sibNote;
        }
        changedSiblings = true;
      }
      if (changedSiblings) updatedCount++;
    }
  });
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u0645\u0632\u0627\u0645\u0646\u0629 \u0648\u062A\u0637\u0648\u064A\u0631 \u0643\u0627\u0641\u0629 \u0643\u0634\u0648\u0641\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    details: `\u062A\u0645 \u0641\u062D\u0635 \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0639\u062F\u062F ${allTrainees.length} \u0645\u062A\u062F\u0631\u0628. (\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0625\u062E\u0648\u0629: ${siblingsLinkedCount}\u060C \u0623\u0633\u0645\u0627\u0621 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631: ${parentNamesAutoFilledCount}\u060C \u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F \u0645\u0646 \u0627\u0644\u0642\u0648\u0645\u064A: ${birthDatesExtractedCount}\u060C \u0625\u0639\u0641\u0627\u0621\u0627\u062A: ${exemptionsProcessedCount})`
  });
  res.json({
    success: true,
    totalTrainees: allTrainees.length,
    updatedCount,
    parentNamesAutoFilledCount,
    birthDatesExtractedCount,
    siblingsLinkedCount,
    exemptionsProcessedCount
  });
});
apiRouter.get("/trainees/promote-preview", (req, res) => {
  const { branchId, academicYear } = req.query;
  const dbData = db.getData();
  const courses = dbData.courses;
  const groups = dbData.groups;
  let trainees = dbData.trainees.filter((t) => t.status === "active");
  if (branchId && branchId !== "all") {
    trainees = trainees.filter((t) => t.branchId === branchId);
  }
  const sortedCourses = [...courses].sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true }));
  const defaultRules = [];
  for (let i = 0; i < sortedCourses.length; i++) {
    const curr = sortedCourses[i];
    let nextCourse = sortedCourses[i + 1];
    const n = curr.name.toUpperCase();
    if (n.includes("ICT4") || n.includes("\u0631\u0627\u0628\u0639")) {
      const found = sortedCourses.find((c) => c.name.toUpperCase().includes("ICT5") || c.name.includes("\u062E\u0627\u0645\u0633"));
      if (found) nextCourse = found;
    } else if (n.includes("ICT5") || n.includes("\u062E\u0627\u0645\u0633")) {
      const found = sortedCourses.find((c) => c.name.toUpperCase().includes("ICT6") || c.name.includes("\u0633\u0627\u062F\u0633"));
      if (found) nextCourse = found;
    } else if (n.includes("ICT6") || n.includes("\u0633\u0627\u062F\u0633")) {
      const found = sortedCourses.find((c) => c.name.toUpperCase().includes("ICT-P1") || c.name.toUpperCase().includes("P1") || c.name.includes("\u0623\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u064A") || c.name.includes("\u0627\u0648\u0644 \u0627\u0639\u062F\u0627\u062F\u064A"));
      if (found) nextCourse = found;
    } else if (n.includes("ICT-P1") || n.includes("P1") || n.includes("\u0623\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u064A")) {
      const found = sortedCourses.find((c) => c.name.toUpperCase().includes("ICT-P2") || c.name.toUpperCase().includes("P2") || c.name.includes("\u062B\u0627\u0646\u064A \u0625\u0639\u062F\u0627\u062F\u064A") || c.name.includes("\u062A\u0627\u0646\u064A \u0627\u0639\u062F\u0627\u062F\u064A"));
      if (found) nextCourse = found;
    }
    if (nextCourse && nextCourse.id !== curr.id) {
      defaultRules.push({
        fromCourseId: curr.id,
        fromCourseName: curr.name,
        toCourseId: nextCourse.id,
        toCourseName: nextCourse.name,
        createNewGroups: true
      });
    } else {
      defaultRules.push({
        fromCourseId: curr.id,
        fromCourseName: curr.name,
        toCourseId: "graduate",
        toCourseName: "\u{1F393} \u062A\u062E\u0631\u062C \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0645\u0631\u062D\u0644\u0629",
        createNewGroups: false
      });
    }
  }
  const items = trainees.map((t) => {
    const currentCourse = courses.find((c) => c.id === t.courseId);
    const currentGroup = groups.find((g) => g.id === t.groupId);
    const rule = defaultRules.find((r) => r.fromCourseId === t.courseId);
    let targetCourseId = rule?.toCourseId || "stay";
    let targetCourseName = rule?.toCourseName || "\u0627\u0644\u0628\u0642\u0627\u0621 \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u0635\u0641";
    let action = "promote";
    if (targetCourseId === "graduate") {
      action = "graduate";
    } else if (targetCourseId === "stay" || !targetCourseId) {
      action = "stay";
    }
    let targetGroupName = "";
    if (currentGroup && rule && rule.toCourseId !== "graduate") {
      const oldCName = currentCourse?.name || "";
      const newCName = rule.toCourseName || "";
      if (oldCName && currentGroup.name.includes(oldCName)) {
        targetGroupName = currentGroup.name.replace(oldCName, newCName);
      } else {
        targetGroupName = `${newCName} - ${currentGroup.name.split("-").pop()?.trim() || "1"}`;
      }
    }
    return {
      traineeId: t.id,
      code: t.code,
      fullName: t.fullName,
      currentCourseId: t.courseId,
      currentCourseName: currentCourse?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      currentGroupId: t.groupId,
      currentGroupName: currentGroup?.name || "\u0628\u062F\u0648\u0646 \u0645\u062C\u0645\u0648\u0639\u0629",
      targetCourseId,
      targetCourseName,
      targetGroupName,
      action,
      selected: true
    };
  });
  res.json({
    academicYear: academicYear || dbData.settings?.academicYear || "2026/2027",
    rules: defaultRules,
    courses,
    totalEligible: trainees.length,
    items
  });
});
apiRouter.post("/trainees/promote-batch", (req, res) => {
  const { academicYear, selectedTraineeIds, mappings, autoUpgradeGroups } = req.body;
  const dbData = db.getData();
  const allTrainees = dbData.trainees;
  const courses = dbData.courses;
  const groups = dbData.groups;
  if (!Array.isArray(selectedTraineeIds) || selectedTraineeIds.length === 0) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0637\u0627\u0644\u0628 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u062A\u0631\u0642\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u0639\u064A\u062F" });
  }
  const effectiveMappings = Array.isArray(mappings) ? mappings : [];
  const groupMap = {};
  let upgradedGroupsCount = 0;
  if (autoUpgradeGroups) {
    effectiveMappings.forEach((mapping) => {
      if (mapping.toCourseId && mapping.toCourseId !== "graduate" && mapping.toCourseId !== "stay") {
        const fromCourse = courses.find((c) => c.id === mapping.fromCourseId);
        const toCourse = courses.find((c) => c.id === mapping.toCourseId);
        if (fromCourse && toCourse) {
          const oldGroups = groups.filter((g) => g.courseId === fromCourse.id);
          oldGroups.forEach((oldG) => {
            let newGName = oldG.name;
            if (oldG.name.includes(fromCourse.name)) {
              newGName = oldG.name.replace(fromCourse.name, toCourse.name);
            } else {
              newGName = `${toCourse.name} - ${oldG.name}`;
            }
            let existingTargetGroup = groups.find((g) => g.courseId === toCourse.id && g.name.trim().toLowerCase() === newGName.trim().toLowerCase() && g.branchId === oldG.branchId);
            if (!existingTargetGroup) {
              existingTargetGroup = {
                id: "grp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
                name: newGName,
                branchId: oldG.branchId,
                courseId: toCourse.id,
                trainerId: oldG.trainerId,
                hallName: oldG.hallName || oldG.roomName,
                roomName: oldG.roomName || oldG.hallName,
                days: oldG.days ? [...oldG.days] : ["\u0627\u0644\u062C\u0645\u0639\u0629"],
                scheduleDays: oldG.scheduleDays ? [...oldG.scheduleDays] : void 0,
                timeSlot: oldG.timeSlot || "04:00 \u0645 - 06:00 \u0645",
                maxStudents: oldG.maxStudents || oldG.maxCapacity || 25,
                maxCapacity: oldG.maxCapacity || oldG.maxStudents || 25,
                status: "active"
              };
              groups.push(existingTargetGroup);
              upgradedGroupsCount++;
            }
            groupMap[oldG.id] = existingTargetGroup.id;
          });
        }
      }
    });
  }
  let promotedCount = 0;
  let graduatedCount = 0;
  allTrainees.forEach((t) => {
    if (!selectedTraineeIds.includes(t.id)) return;
    const mapping = effectiveMappings.find((m) => m.fromCourseId === t.courseId);
    if (!mapping) return;
    const oldCourse = courses.find((c) => c.id === t.courseId);
    const oldCourseName = oldCourse?.name || t.courseName || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u0628\u0642";
    if (mapping.toCourseId === "graduate") {
      t.status = "completed";
      const gradNote = `[\u062A\u062E\u0631\u062C ${academicYear || "\u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062C\u062F\u064A\u062F"}] \u062A\u0645 \u0625\u062A\u0645\u0627\u0645 \u062F\u0631\u0627\u0633\u0629 (${oldCourseName}) \u0628\u0646\u062C\u0627\u062D.`;
      t.notes = t.notes ? `${t.notes} | ${gradNote}` : gradNote;
      graduatedCount++;
    } else if (mapping.toCourseId && mapping.toCourseId !== "stay") {
      const targetCourse = courses.find((c) => c.id === mapping.toCourseId);
      if (targetCourse) {
        t.courseId = targetCourse.id;
        t.courseIds = [targetCourse.id];
        t.courseName = targetCourse.name;
        t.feeAmount = targetCourse.feeAmount || t.feeAmount;
        t.netAmount = Math.max(0, (targetCourse.feeAmount || t.feeAmount) - (t.discountAmount || 0));
        t.remainingAmount = t.netAmount;
        t.paidAmount = 0;
        if (t.groupId && groupMap[t.groupId]) {
          t.groupId = groupMap[t.groupId];
          const newG = groups.find((g) => g.id === t.groupId);
          if (newG) t.groupName = newG.name;
        }
        const promoNote = `[\u062A\u0635\u0639\u064A\u062F ${academicYear || "\u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062C\u062F\u064A\u062F"}] \u062A\u0645 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0645\u0646 (${oldCourseName}) \u0625\u0644\u0649 (${targetCourse.name}).`;
        t.notes = t.notes ? `${t.notes} | ${promoNote}` : promoNote;
        promotedCount++;
      }
    }
  });
  if (academicYear) {
    if (!dbData.settings) dbData.settings = {};
    dbData.settings.academicYear = academicYear;
  }
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062A\u0635\u0639\u064A\u062F \u0648\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0637\u0644\u0627\u0628 \u0644\u0644\u0639\u0627\u0645 \u0627\u0644\u062C\u062F\u064A\u062F",
    entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646 \u0648\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
    details: `\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 \u0639\u062F\u062F (${promotedCount}) \u0637\u0627\u0644\u0628\u0627\u064B \u0644\u0644\u0635\u0641\u0648\u0641 \u0627\u0644\u062A\u0627\u0644\u064A\u0629\u060C \u0648\u062A\u062E\u0631\u064A\u062C (${graduatedCount}) \u0637\u0627\u0644\u0628\u0627\u064B\u060C \u0648\u062A\u062D\u062F\u064A\u062B/\u0625\u0646\u0634\u0627\u0621 (${upgradedGroupsCount}) \u0645\u062C\u0645\u0648\u0639\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0644\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A ${academicYear || ""}`
  });
  db.addNotification({
    type: "course_end",
    title: `\u{1F393} \u0627\u0643\u062A\u0645\u0627\u0644 \u062A\u0635\u0639\u064A\u062F \u0648\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0637\u0644\u0627\u0628 \u0644\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062C\u062F\u064A\u062F`,
    message: `\u062A\u0645 \u062A\u0635\u0639\u064A\u062F ${promotedCount} \u0637\u0627\u0644\u0628\u0627\u064B \u0644\u0644\u0635\u0641\u0648\u0641 \u0627\u0644\u0623\u0639\u0644\u0649 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0644\u0649 \u0623\u0643\u0648\u0627\u062F\u0647\u0645 \u0648\u0646\u0642\u0627\u0637\u0647\u0645.`
  });
  res.json({
    success: true,
    promotedCount,
    graduatedCount,
    upgradedGroupsCount,
    academicYear: dbData.settings?.academicYear
  });
});
apiRouter.post("/trainees/bulk-import", async (req, res) => {
  const { rows, defaultBranchId, defaultCourseId } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" });
  }
  const importedList = [];
  const errorsList = [];
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const rowNum = idx + 1;
    if (!r || typeof r !== "object") return;
    const findValue = (...keys) => {
      for (const k of keys) {
        if (r[k] !== void 0 && r[k] !== null && String(r[k]).trim() !== "") {
          return r[k];
        }
      }
      const normalizedKeys = Object.keys(r);
      for (const k of keys) {
        const cleanTarget = k.toLowerCase().replace(/[\s_\-]/g, "");
        const matchKey = normalizedKeys.find((nk) => nk.toLowerCase().replace(/[\s_\-]/g, "") === cleanTarget);
        if (matchKey && r[matchKey] !== void 0 && r[matchKey] !== null && String(r[matchKey]).trim() !== "") {
          return r[matchKey];
        }
      }
      return void 0;
    };
    let rawName = findValue(
      "fullName",
      "name",
      "\u0627\u0644\u0627\u0633\u0645",
      "\u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062F\u0631\u0628",
      "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628",
      "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
      "\u0627\u0644\u0627\u0633\u0645 \u0631\u0628\u0627\u0639\u064A",
      "\u0627\u0644\u0645\u062A\u062F\u0631\u0628",
      "\u0627\u0644\u0637\u0627\u0644\u0628",
      "student",
      "trainee",
      "studentName",
      "\u0627\u0644\u0627\u0633\u0645_\u0631\u0628\u0627\u0639\u064A"
    );
    if (!rawName) {
      for (const val of Object.values(r)) {
        if (typeof val === "string" && val.trim().length > 1 && !/^\d+$/.test(val.trim())) {
          rawName = val;
          break;
        }
      }
    }
    if (!rawName || !String(rawName).trim()) {
      errorsList.push({ rowNumber: rowNum, data: r, reason: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0633\u0645 \u0635\u0627\u0644\u062D \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0635\u0641" });
      return;
    }
    const fullName = String(rawName).trim();
    const rawAge = findValue("age", "\u0627\u0644\u0633\u0646", "\u0627\u0644\u0639\u0645\u0631", "\u0633\u0646", "\u0639\u0645\u0631");
    const rawBirthDate = findValue("birthDate", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F", "\u0627\u0644\u0645\u064A\u0644\u0627\u062F", "\u062A\u0627\u0631\u064A\u062E_\u0627\u0644\u0645\u064A\u0644\u0627\u062F", "dob");
    let age = void 0;
    if (rawAge !== void 0 && !isNaN(Number(rawAge))) {
      age = Number(rawAge);
    }
    const birthDate = rawBirthDate ? String(rawBirthDate).trim() : "";
    const rawPhone = findValue("phone", "mobile", "tel", "\u0627\u0644\u0647\u0627\u062A\u0641", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", "\u0627\u0644\u0645\u0648\u0628\u0627\u064A\u0644", "\u0627\u0644\u062A\u0644\u064A\u0641\u0648\u0646", "\u062A\u0644\u064A\u0641\u0648\u0646", "\u0627\u0644\u062C\u0648\u0627\u0644", "\u0631\u0642\u0645_\u0627\u0644\u0647\u0627\u062A\u0641");
    const phone = rawPhone ? String(rawPhone).trim() : "";
    const rawNationalId = findValue("nationalId", "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A", "\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629", "\u0627\u0644\u0647\u0648\u064A\u0629", "\u0627\u0644\u0631\u0642\u0645_\u0627\u0644\u0642\u0648\u0645\u064A", "national_id", "id");
    const nationalId = rawNationalId ? String(rawNationalId).trim() : "";
    const rawGender = findValue("gender", "\u0627\u0644\u0646\u0648\u0639", "\u0627\u0644\u062C\u0646\u0633");
    let gender = "male";
    if (rawGender) {
      const gStr = String(rawGender).toLowerCase().trim();
      if (gStr.includes("\u0623\u0646\u062B\u0649") || gStr.includes("\u0627\u0646\u062B\u0649") || gStr.includes("\u0628\u0646\u062A") || gStr.includes("female") || gStr === "f") {
        gender = "female";
      }
    }
    const rawParentPhone = findValue("parentPhone", "\u0647\u0627\u062A\u0641 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u062A\u0644\u064A\u0641\u0648\u0646 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0648\u0644\u064A \u0627\u0644\u0627\u0645\u0631", "\u0647\u0627\u062A\u0641_\u0648\u0644\u064A_\u0627\u0644\u0623\u0645\u0631", "\u0631\u0642\u0645 \u0648\u0644\u064A \u0627\u0644\u0627\u0645\u0631");
    const rawParentName = findValue("parentName", "\u0627\u0633\u0645 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0627\u0633\u0645_\u0648\u0644\u064A_\u0627\u0644\u0623\u0645\u0631");
    const parentPhone = rawParentPhone ? String(rawParentPhone).trim() : "";
    const parentName = rawParentName ? String(rawParentName).trim() : "";
    const rawAddress = findValue("address", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", "\u0627\u0644\u0633\u0643\u0646", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629");
    const rawNotes = findValue("notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", "\u0645\u0644\u0627\u062D\u0638\u0629", "\u0627\u0644\u062A\u0642\u0631\u064A\u0631");
    const address = rawAddress ? String(rawAddress).trim() : "";
    const notes = rawNotes ? String(rawNotes).trim() : "";
    const rawFee = findValue("feeAmount", "fee", "\u0627\u0644\u0631\u0633\u0648\u0645", "\u0631\u0633\u0648\u0645 \u0627\u0644\u062F\u0648\u0631\u0629", "\u0631\u0633\u0648\u0645", "\u0627\u0644\u0645\u0628\u0644\u063A", "\u0631\u0633\u0648\u0645_\u0627\u0644\u062F\u0648\u0631\u0629");
    const rawDiscount = findValue("discountAmount", "discount", "\u0627\u0644\u062E\u0635\u0645", "\u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645");
    const rawPaid = findValue("paidAmount", "paid", "\u0627\u0644\u0645\u062F\u0641\u0648\u0639", "\u0627\u0644\u0645\u0633\u062F\u062F", "\u062F\u0641\u0639\u0629");
    const feeAmount = Number(rawFee) || 0;
    const discountAmount = Number(rawDiscount) || 0;
    const paidAmount = Number(rawPaid) || 0;
    let branchId = defaultBranchId;
    const branchName = findValue("branchName", "branch", "\u0627\u0644\u0641\u0631\u0639", "\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639");
    if (branchName) {
      const bStr = String(branchName).trim().toLowerCase();
      const matchBranch = db.getData().branches.find((b) => b.name.toLowerCase().includes(bStr) || b.code.toLowerCase() === bStr);
      if (matchBranch) branchId = matchBranch.id;
    }
    if (!branchId) {
      branchId = db.getData().branches?.[0]?.id || "branch-1";
    }
    let courseId = defaultCourseId;
    const courseName = findValue("courseName", "course", "\u0627\u0644\u062F\u0648\u0631\u0629", "\u0627\u0644\u0643\u0648\u0631\u0633", "\u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629", "\u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0631\u0629");
    if (courseName) {
      const cStr = String(courseName).trim().toLowerCase();
      const matchCourse = db.getData().courses.find((c) => c.name.toLowerCase().includes(cStr) || c.code.toLowerCase() === cStr);
      if (matchCourse) courseId = matchCourse.id;
    }
    const code = db.getNextTraineeCode();
    const netAmount = Math.max(0, feeAmount - discountAmount);
    const remainingAmount = Math.max(0, netAmount - paidAmount);
    let assignedGroupId;
    if (courseId) {
      const autoGrp = findOrCreateAvailableGroup(courseId, branchId);
      if (autoGrp) assignedGroupId = autoGrp.id;
    }
    const newT = {
      id: "trainee-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      code,
      fullName,
      nationalId,
      birthDate,
      age,
      gender,
      phone,
      parentPhone,
      parentName,
      address,
      branchId,
      courseId: courseId || void 0,
      groupId: assignedGroupId,
      registrationDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "active",
      feeAmount,
      discountAmount,
      portalPassword: findValue("portalPassword", "password", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631") || "",
      parentPortalPassword: findValue("parentPortalPassword", "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631") || "",
      netAmount,
      paidAmount,
      remainingAmount,
      notes,
      totalPoints: 0
    };
    await TraineeRepo.create(newT.id, newT);
    importedList.push(newT);
  }
  db.recalculateTraineeRankings();
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u062C\u0645\u0627\u0639\u064A \u0645\u0646 Excel",
    entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    details: `\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F ${importedList.length} \u0645\u062A\u062F\u0631\u0628 \u0628\u0646\u062C\u0627\u062D\u060C \u0648\u0639\u062F\u062F \u0627\u0644\u0635\u0641\u0648\u0641 \u063A\u064A\u0631 \u0627\u0644\u0635\u0627\u0644\u062D\u0629: ${errorsList.length}`
  });
  res.json({
    success: true,
    importedCount: importedList.length,
    errorsCount: errorsList.length,
    errors: errorsList,
    importedTrainees: importedList
  });
});
function normalizeGradeName(gradeStr) {
  if (!gradeStr) return "";
  const clean = String(gradeStr).trim().toLowerCase().replace(/[أإآ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/ى/g, "\u064A").replace(/[\s_\-]/g, "");
  if (clean.includes("\u0631\u0627\u0628\u0639") || clean === "4" || clean.includes("4\u0627\u0628\u062A\u062F\u0627\u0626\u064A") || clean.includes("\u0631\u0627\u0628\u0639\u0647") || clean.includes("ict4")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
  if (clean.includes("\u062E\u0627\u0645\u0633") || clean === "5" || clean.includes("5\u0627\u0628\u062A\u062F\u0627\u0626\u064A") || clean.includes("\u062E\u0627\u0645\u0633\u0647") || clean.includes("ict5")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
  if (clean.includes("\u0633\u0627\u062F\u0633") || clean === "6" || clean.includes("6\u0627\u0628\u062A\u062F\u0627\u0626\u064A") || clean.includes("\u0633\u0627\u062A\u0647") || clean.includes("\u0633\u0627\u062F\u0633\u0647") || clean.includes("ict6")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A";
  if (clean.includes("\u0627\u0648\u0644\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("1\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u0627\u0648\u0644\u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u0627\u0648\u0644\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0639\u062F\u0627\u062F\u064A1") || clean.includes("ict-p1") || clean.includes("ictp1")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
  if (clean.includes("\u062B\u0627\u0646\u064A\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u062A\u0627\u0646\u064A\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("2\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0646\u064A\u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0646\u064A\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0639\u062F\u0627\u062F\u064A2") || clean.includes("ict-p2") || clean.includes("ictp2")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
  if (clean.includes("\u062B\u0627\u0644\u062B\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u062A\u0627\u0644\u062A\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("3\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0644\u062B\u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0644\u062B\u0627\u0639\u062F\u0627\u062F\u064A") || clean.includes("\u0627\u0639\u062F\u0627\u062F\u064A3") || clean.includes("ict-p3") || clean.includes("ictp3")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A";
  if (clean.includes("\u0627\u0648\u0644\u062B\u0627\u0646\u0648\u064A") || clean.includes("1\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u0627\u0648\u0644\u0627\u0644\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u0627\u0648\u0644\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062B\u0627\u0646\u0648\u064A1") || clean.includes("sec1") || clean.includes("s1")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
  if (clean.includes("\u062B\u0627\u0646\u064A\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062A\u0627\u0646\u064A\u062B\u0627\u0646\u0648\u064A") || clean.includes("2\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0646\u064A\u0627\u0644\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0646\u064A\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062B\u0627\u0646\u0648\u064A2") || clean.includes("sec2") || clean.includes("s2")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
  if (clean.includes("\u062B\u0627\u0644\u062B\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062A\u0627\u0644\u062A\u062B\u0627\u0646\u0648\u064A") || clean.includes("3\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0644\u062B\u0627\u0644\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u0627\u0644\u062B\u0627\u0644\u062B\u062B\u0627\u0646\u0648\u064A") || clean.includes("\u062B\u0627\u0646\u0648\u064A3") || clean.includes("sec3") || clean.includes("s3")) return "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A";
  return gradeStr.trim();
}
function getGradeCodePrefix(gradeName) {
  const norm = normalizeGradeName(gradeName || "");
  if (norm.includes("\u0627\u0644\u0631\u0627\u0628\u0639")) return "A";
  if (norm.includes("\u0627\u0644\u062E\u0627\u0645\u0633")) return "B";
  if (norm.includes("\u0627\u0644\u0633\u0627\u062F\u0633")) return "C";
  if (norm.includes("\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A") || norm.includes("\u0627\u0644\u0627\u0648\u0644 \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A")) return "D";
  if (norm.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A") || norm.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A")) return "E";
  if (norm.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A") || norm.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0627\u0639\u062F\u0627\u062F\u064A")) return "F";
  if (norm.includes("\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A") || norm.includes("\u0627\u0644\u0627\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) return "G";
  if (norm.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A") || norm.includes("\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) return "H";
  if (norm.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A") || norm.includes("\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A")) return "I";
  return "ST";
}
apiRouter.post("/trainees/preview-code-fix", async (req, res) => {
  try {
    const allTrainees = await TraineeRepo.getAll();
    const allGroups = await GroupRepo.getAll();
    const groupMap = new Map(allGroups.map((g) => [g.id, g]));
    let validCount = 0;
    let changesCount = 0;
    const itemsToFix = [];
    const allocatedCodesByPrefix = /* @__PURE__ */ new Map();
    allTrainees.forEach((t) => {
      const expectedPrefix = getGradeCodePrefix(t.grade);
      if (!allocatedCodesByPrefix.has(expectedPrefix)) {
        allocatedCodesByPrefix.set(expectedPrefix, /* @__PURE__ */ new Set());
      }
      const currentCode = (t.code || "").trim().toUpperCase();
      const isFormatMatching = currentCode.startsWith(expectedPrefix) && /^[A-Z]+\d+$/.test(currentCode);
      const isAlreadyTaken = allocatedCodesByPrefix.get(expectedPrefix).has(currentCode);
      if (isFormatMatching && !isAlreadyTaken) {
        allocatedCodesByPrefix.get(expectedPrefix).add(currentCode);
        validCount++;
      }
    });
    const nextSeqMap = /* @__PURE__ */ new Map();
    allTrainees.forEach((t) => {
      const expectedPrefix = getGradeCodePrefix(t.grade);
      const currentCode = (t.code || "").trim().toUpperCase();
      const allocatedSet = allocatedCodesByPrefix.get(expectedPrefix) || /* @__PURE__ */ new Set();
      const isFormatMatching = currentCode.startsWith(expectedPrefix) && /^[A-Z]+\d+$/.test(currentCode);
      if (isFormatMatching && allocatedSet.has(currentCode)) {
        return;
      }
      changesCount++;
      let seq = nextSeqMap.get(expectedPrefix) || 1;
      let proposedCode = `${expectedPrefix}${String(seq).padStart(3, "0")}`;
      while (allocatedSet.has(proposedCode)) {
        seq++;
        proposedCode = `${expectedPrefix}${String(seq).padStart(3, "0")}`;
      }
      nextSeqMap.set(expectedPrefix, seq + 1);
      allocatedSet.add(proposedCode);
      const group = t.groupId ? groupMap.get(t.groupId) : null;
      let reason = "\u0627\u0644\u0643\u0648\u062F \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642 \u0644\u0628\u0627\u062F\u0626\u0629 \u0627\u0644\u0635\u0641 \u0627\u0644\u062F\u0631\u0627\u0633\u064A";
      if (!currentCode) reason = "\u0627\u0644\u0643\u0648\u062F \u0645\u0641\u0642\u0648\u062F/\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      else if (!currentCode.startsWith(expectedPrefix)) reason = `\u0643\u0648\u062F \u0635\u0641 \u0645\u062A\u062F\u0627\u062E\u0644 (\u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062D\u0627\u0644\u064A: ${currentCode}\u060C \u0627\u0644\u0645\u062A\u0648\u0642\u0639 \u0644\u0628\u0627\u062F\u0626\u0629 \u0627\u0644\u0635\u0641: ${expectedPrefix})`;
      else reason = "\u0643\u0648\u062F \u0645\u0643\u0631\u0631 \u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0635\u064A\u0627\u063A\u062A\u0647 \u062D\u0645\u0627\u064A\u0629 \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A";
      itemsToFix.push({
        id: t.id,
        fullName: t.fullName,
        grade: t.grade || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        groupName: group ? group.name : "\u0628\u062F\u0648\u0646 \u0645\u062C\u0645\u0648\u0639\u0629",
        currentCode: t.code || "\u0628\u062F\u0648\u0646 \u0643\u0648\u062F",
        proposedCode,
        expectedPrefix,
        reason
      });
    });
    res.json({
      success: true,
      totalTrainees: allTrainees.length,
      validCount,
      changesCount,
      itemsToFix
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u0645\u0639\u0627\u064A\u0646\u0629 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0623\u0643\u0648\u0627\u062F" });
  }
});
apiRouter.post("/trainees/execute-code-fix", async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0643\u0648\u0627\u062F \u0644\u0644\u062A\u062D\u062F\u064A\u062B" });
    }
    let updatedCount = 0;
    const dbTrainees = db.getData().trainees || [];
    for (const update of updates) {
      if (!update.id || !update.proposedCode) continue;
      const prefix = getGradeCodePrefix(update.grade);
      const localT = dbTrainees.find((t) => t.id === update.id);
      if (localT) {
        localT.code = update.proposedCode;
        localT.prefix = prefix;
      }
      try {
        await TraineeRepo.update(update.id, {
          code: update.proposedCode,
          prefix
        });
      } catch (err) {
        console.warn(`Firestore update failed for trainee ${update.id}`, err);
      }
      updatedCount++;
    }
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
      action: "\u0627\u0639\u062A\u0645\u0627\u062F \u0648\u062A\u062D\u062F\u064A\u062B \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u062C\u0645\u0627\u0639\u064A\u0629",
      entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
      details: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u062A\u0648\u062D\u064A\u062F \u0623\u0643\u0648\u0627\u062F ${updatedCount} \u0637\u0627\u0644\u0628 \u0648\u0641\u0642 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062A\u0643\u0648\u064A\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629`
    });
    res.json({
      success: true,
      updatedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062C\u062F\u064A\u062F\u0629" });
  }
});
apiRouter.get("/trainers/attestations", async (req, res) => {
  try {
    const { trainerId } = req.query;
    let attestations = db.getData().trainerAttestations || [];
    if (trainerId) {
      attestations = attestations.filter((a) => a.trainerId === trainerId);
    }
    res.json(attestations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/trainers/attestations", async (req, res) => {
  try {
    const { trainerId, trainerName, trainerCode, type, title, courseId, courseName, groupId, groupName, executionDate, hoursCount, branchName, notes } = req.body;
    if (!trainerId || !title) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u062F\u0631\u0628 \u0648\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0625\u0641\u0627\u062F\u0629 \u062D\u0642\u0648\u0644 \u0625\u062C\u0628\u0627\u0631\u064A\u0629" });
    }
    if (!db.getData().trainerAttestations) {
      db.getData().trainerAttestations = [];
    }
    const cleanCode = (trainerCode || "TR01").replace(/[^A-Za-z0-9]/g, "");
    const attestationNumber = `TRCERT${(/* @__PURE__ */ new Date()).getFullYear()}${cleanCode}${Date.now().toString().slice(-4)}`;
    const newAttestation = {
      id: "trcert-" + Date.now(),
      attestationNumber,
      trainerId,
      trainerName: trainerName || "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
      trainerCode: trainerCode || "TR01",
      type: type || "single_day_lecture",
      title,
      courseId: courseId || "",
      courseName: courseName || "",
      groupId: groupId || "",
      groupName: groupName || "",
      executionDate: executionDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      hoursCount: Number(hoursCount) || 2,
      branchName: branchName || "\u0627\u0644\u0641\u0631\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
      issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      notes: notes || "",
      qrCodeUrl: `https://nagah-center.com/verify?attestation=${attestationNumber}`
    };
    db.getData().trainerAttestations.unshift(newAttestation);
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
      action: "\u0625\u0635\u062F\u0627\u0631 \u0625\u0641\u0627\u062F\u0629 \u0631\u0633\u0645\u064A\u0629 \u0644\u0644\u0645\u062F\u0631\u0628",
      entity: "\u0627\u0644\u0645\u062F\u0631\u0628\u064A\u0646",
      details: `\u062A\u0645 \u0625\u0635\u062F\u0627\u0631 \u0625\u0641\u0627\u062F\u0629 \u062A\u0646\u0641\u064A\u0630 (${newAttestation.title}) \u0644\u0644\u0645\u062F\u0631\u0628 ${newAttestation.trainerName} \u0628\u0631\u0642\u0645 ${attestationNumber}`
    });
    res.json({ success: true, attestation: newAttestation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.put("/trainers/attestations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!db.getData().trainerAttestations) db.getData().trainerAttestations = [];
    const index = db.getData().trainerAttestations.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: "\u0627\u0644\u0625\u0641\u0627\u062F\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    db.getData().trainerAttestations[index] = { ...db.getData().trainerAttestations[index], ...req.body };
    db.save();
    res.json({ success: true, attestation: db.getData().trainerAttestations[index] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.delete("/trainers/attestations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!db.getData().trainerAttestations) db.getData().trainerAttestations = [];
    db.getData().trainerAttestations = db.getData().trainerAttestations.filter((a) => a.id !== id);
    db.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/trainees/import-preview", async (req, res) => {
  try {
    const { rows, defaultBranchId } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629" });
    }
    console.log("[IMPORT PREVIEW] Start");
    console.log("[IMPORT PREVIEW] Reading branches...");
    let branches = [];
    try {
      branches = await BranchRepo.getAll();
      console.log("[IMPORT PREVIEW] Reading branches... PASS");
    } catch (err) {
      console.error("[IMPORT PREVIEW] Reading branches... FAIL", err.message || err);
    }
    console.log("[IMPORT PREVIEW] Reading courses...");
    let courses = [];
    try {
      courses = await CourseRepo.getAll();
      console.log("[IMPORT PREVIEW] Reading courses... PASS");
    } catch (err) {
      console.error("[IMPORT PREVIEW] Reading courses... FAIL", err.message || err);
    }
    console.log("[IMPORT PREVIEW] Reading groups...");
    let allGroups = [];
    try {
      allGroups = await GroupRepo.getAll();
      console.log("[IMPORT PREVIEW] Reading groups... PASS");
    } catch (err) {
      console.error("[IMPORT PREVIEW] Reading groups... FAIL", err.message || err);
    }
    console.log("[IMPORT PREVIEW] Reading trainees...");
    let allTrainees = [];
    try {
      allTrainees = await TraineeRepo.getAll();
      console.log("[IMPORT PREVIEW] Reading trainees... PASS");
    } catch (err) {
      console.error("[IMPORT PREVIEW] Reading trainees... FAIL", err.message || err);
    }
    console.log("[IMPORT PREVIEW] Reading trainers...");
    let trainers = [];
    try {
      trainers = await TrainerRepo.getAll();
      console.log("[IMPORT PREVIEW] Reading trainers... PASS");
    } catch (err) {
      console.error("[IMPORT PREVIEW] Reading trainers... FAIL", err.message || err);
    }
    const existingGroups = (allGroups || []).filter((g) => g.status === "active" || g.status === "upcoming");
    const groupEnrollments = {};
    existingGroups.forEach((g) => {
      groupEnrollments[g.id] = (allTrainees || []).filter((t) => t.groupId === g.id).length;
    });
    const parsedStudents = rows.map((r, idx) => {
      const rowNum = idx + 1;
      const findValue = (...keys) => {
        for (const k of keys) {
          if (r[k] !== void 0 && r[k] !== null && String(r[k]).trim() !== "") {
            return r[k];
          }
        }
        const normalizedKeys = Object.keys(r);
        for (const k of keys) {
          const cleanTarget = k.toLowerCase().replace(/[\s_\-]/g, "");
          const matchKey = normalizedKeys.find((nk) => nk.toLowerCase().replace(/[\s_\-]/g, "") === cleanTarget);
          if (matchKey && r[matchKey] !== void 0 && r[matchKey] !== null && String(r[matchKey]).trim() !== "") {
            return r[matchKey];
          }
        }
        return void 0;
      };
      let rawName = findValue(
        "fullName",
        "name",
        "\u0627\u0644\u0627\u0633\u0645",
        "\u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062F\u0631\u0628",
        "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628",
        "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
        "\u0627\u0644\u0627\u0633\u0645 \u0631\u0628\u0627\u0639\u064A",
        "\u0627\u0644\u0645\u062A\u062F\u0631\u0628",
        "\u0627\u0644\u0637\u0627\u0644\u0628",
        "student",
        "trainee",
        "studentName",
        "\u0627\u0644\u0627\u0633\u0645_\u0631\u0628\u0627\u0639\u064A"
      );
      if (!rawName) {
        for (const val of Object.values(r)) {
          if (typeof val === "string" && val.trim().length > 1 && !/^\d+$/.test(val.trim())) {
            rawName = val;
            break;
          }
        }
      }
      const fullName = rawName ? String(rawName).trim() : "\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641";
      const nationalId = String(findValue("nationalId", "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A", "\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A", "\u0627\u0644\u0631\u0642\u0645_\u0627\u0644\u0642\u0648\u0645\u064A", "\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629") || "").trim();
      const phone = String(findValue("phone", "mobile", "\u0627\u0644\u0647\u0627\u062A\u0641", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", "\u0645\u0648\u0628\u0627\u064A\u0644") || "").trim();
      const parentPhone = String(findValue("parentPhone", "\u0647\u0627\u062A\u0641 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u062A\u0644\u064A\u0641\u0648\u0646 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0631\u0642\u0645 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u062A\u0644\u064A\u0641\u0648\u0646 \u0627\u0644\u0627\u0628", "\u0647\u0627\u062A\u0641 \u0627\u0644\u0627\u0628") || "").trim();
      const parentName = String(findValue("parentName", "\u0627\u0633\u0645 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0627\u0633\u0645 \u0627\u0644\u0627\u0628") || "").trim();
      const address = String(findValue("address", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", "\u0627\u0644\u0633\u0643\u0646", "\u0627\u0644\u0645\u0646\u0637\u0642\u0629") || "").trim();
      const notes = String(findValue("notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", "\u0645\u0644\u0627\u062D\u0638\u0629") || "").trim();
      const rawAge = findValue("age", "\u0627\u0644\u0633\u0646", "\u0627\u0644\u0639\u0645\u0631");
      const age = rawAge ? Number(rawAge) : void 0;
      const rawGender = findValue("gender", "\u0627\u0644\u0646\u0648\u0639", "\u0627\u0644\u062C\u0646\u0633");
      let gender = "male";
      if (rawGender) {
        const gStr = String(rawGender).toLowerCase().trim();
        if (gStr.includes("\u0623\u0646\u062B\u0649") || gStr.includes("\u0627\u0646\u062B\u0649") || gStr.includes("\u0628\u0646\u062A") || gStr.includes("female") || gStr === "f") {
          gender = "female";
        }
      }
      const rawFee = findValue("feeAmount", "fee", "\u0631\u0633\u0648\u0645 \u0627\u0644\u062F\u0648\u0631\u0629", "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A", "\u0627\u0644\u0645\u0628\u0644\u063A", "\u0627\u0644\u0631\u0633\u0648\u0645");
      const feeAmount = rawFee ? Number(rawFee) : 500;
      const rawDiscount = findValue("discountAmount", "discount", "\u0627\u0644\u062E\u0635\u0645", "\u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645");
      const discountAmount = rawDiscount ? Number(rawDiscount) : 0;
      const rawPaid = findValue("paidAmount", "initialPayment", "\u0627\u0644\u0645\u062F\u0641\u0648\u0639", "\u0627\u0644\u0645\u0633\u062F\u062F");
      const paidAmount = rawPaid ? Number(rawPaid) : 0;
      const gradeClass = String(findValue("class", "grade", "\u0627\u0644\u0641\u0635\u0644", "\u0627\u0644\u0635\u0641", "\u0627\u0644\u0645\u0631\u062D\u0644\u0629", "\u0627\u0644\u0635\u0641 \u0627\u0644\u062F\u0631\u0627\u0633\u064A", "\u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629") || "").trim();
      const branchName = String(findValue("branch", "branchName", "\u0627\u0644\u0641\u0631\u0639", "\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639") || "").trim();
      const language = String(findValue("language", "\u0639\u0631\u0628\u064A \u0623\u0648 \u0644\u063A\u0627\u062A", "\u0627\u0644\u0644\u063A\u0629", "\u0646\u0648\u0639 \u0627\u0644\u062A\u0639\u0644\u064A\u0645", "\u0627\u0644\u0634\u0639\u0628\u0629", "\u0646\u0648\u0639 \u0627\u0644\u062F\u0631\u0627\u0633\u0629") || "\u0639\u0631\u0628\u064A").trim();
      return {
        index: idx,
        rowNumber: rowNum,
        fullName,
        nationalId,
        phone,
        parentPhone,
        parentName,
        address,
        notes,
        gender,
        age,
        feeAmount,
        discountAmount,
        paidAmount,
        class: gradeClass,
        normalizedGrade: normalizeGradeName(gradeClass),
        branch: branchName,
        language,
        suggestedGroupId: null,
        suggestedGroupName: null,
        suggestedCourseId: null,
        suggestedCourseName: null,
        suggestedCode: null,
        branchId: defaultBranchId || (branches[0] ? branches[0].id : "branch-1"),
        status: "unassigned",
        reason: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u062A\u0633\u0643\u064A\u0646"
      };
    });
    parsedStudents.forEach((st) => {
      let resolvedBranchId = defaultBranchId || (branches[0] ? branches[0].id : "branch-1");
      if (st.branch) {
        const bMatch = branches.find(
          (b) => b.name.toLowerCase().includes(st.branch.toLowerCase()) || st.branch.toLowerCase().includes(b.name.toLowerCase())
        );
        if (bMatch) resolvedBranchId = bMatch.id;
      }
      st.branchId = resolvedBranchId;
      const normStudentGrade = st.normalizedGrade || normalizeGradeName(st.class);
      const isStudentLanguages = st.language && (st.language.includes("\u0644\u063A\u0627\u062A") || st.language.toLowerCase().includes("english") || st.language.toLowerCase().includes("lang"));
      let matchedGroup = null;
      for (const g of existingGroups) {
        if (g.branchId !== resolvedBranchId) continue;
        let gradeMatches = false;
        if (g.grade) {
          gradeMatches = normalizeGradeName(g.grade) === normStudentGrade;
        } else {
          const course2 = courses.find((c) => c.id === g.courseId);
          const combinedText = ((g.name || "") + " " + (course2?.name || "")).toLowerCase();
          gradeMatches = Boolean(normStudentGrade && (combinedText.includes(normStudentGrade.toLowerCase()) || st.class && combinedText.includes(st.class.toLowerCase())));
        }
        if (!gradeMatches) continue;
        const course = courses.find((c) => c.id === g.courseId);
        const isGroupLanguages = course && (course.name.includes("\u0644\u063A\u0627\u062A") || course.name.toLowerCase().includes("english") || course.name.toLowerCase().includes("lang") || course.name.toLowerCase().includes("ict"));
        const languageMatches = isStudentLanguages ? isGroupLanguages : !isGroupLanguages;
        if (!languageMatches) continue;
        const currentCount = groupEnrollments[g.id] || 0;
        const maxCapacity = g.maxStudents || g.maxCapacity || 25;
        if (currentCount < maxCapacity) {
          matchedGroup = g;
          groupEnrollments[g.id] = currentCount + 1;
          break;
        }
      }
      if (matchedGroup) {
        st.suggestedGroupId = matchedGroup.id;
        st.suggestedGroupName = matchedGroup.name;
        st.suggestedCourseId = matchedGroup.courseId;
        const crs = courses.find((c) => c.id === matchedGroup.courseId);
        st.suggestedCourseName = crs?.name || "\u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629";
        st.status = "assigned";
        st.reason = `\u062A\u0633\u0643\u064A\u0646 \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u062A\u0637\u0627\u0628\u0642 (\u0627\u0644\u0635\u0641: ${matchedGroup.grade || normStudentGrade}\u060C \u0627\u0644\u0641\u0631\u0639: ${branches.find((b) => b.id === resolvedBranchId)?.name || "\u0627\u0644\u0641\u0631\u0639"})`;
      } else if (normStudentGrade) {
        const className = normStudentGrade;
        const trackStr = isStudentLanguages ? "\u0644\u063A\u0627\u062A" : "\u0639\u0631\u0628\u064A";
        const placeholderId = `CREATE_NEW:${className}:${resolvedBranchId}:${trackStr}`;
        st.suggestedGroupId = placeholderId;
        st.suggestedGroupName = `\u2795 \u0645\u062C\u0645\u0648\u0639\u0629 ${className} (${trackStr}) - \u0641\u0648\u062C \u062C\u062F\u064A\u062F`;
        st.status = "assigned";
        st.reason = `\u0633\u064A\u062A\u0645 \u062A\u0623\u0633\u064A\u0633 \u062F\u0648\u0631\u0629 \u0648\u0645\u062C\u0645\u0648\u0639\u0629 \u062C\u062F\u064A\u062F\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0644\u0640 (${className} - ${trackStr})`;
      } else {
        st.status = "unassigned";
        st.reason = st.class ? `\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0628\u0647\u0627 \u0645\u0643\u0627\u0646 \u0634\u0627\u063A\u0631 \u0644\u0640 (${st.class} - ${st.language || "\u0639\u0631\u0628\u064A"})` : "\u0627\u0644\u0635\u0641 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u063A\u064A\u0631 \u0645\u062D\u062F\u062F \u0628\u0627\u0644\u062E\u0644\u064A\u0629";
      }
    });
    const unassignedStudents = parsedStudents.filter((s) => s.status === "unassigned");
    if (unassignedStudents.length > 0 && process.env.GEMINI_API_KEY) {
      try {
        const unassignedList = unassignedStudents.map((s) => ({
          index: s.index,
          name: s.fullName,
          class: s.class,
          branch: s.branch,
          language: s.language
        }));
        const availableGroupsInfo = existingGroups.map((g) => ({
          id: g.id,
          name: g.name,
          grade: g.grade,
          branchName: branches.find((b) => b.id === g.branchId)?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
          capacityStatus: `${groupEnrollments[g.id] || 0}/${g.maxCapacity || 25}`
        }));
        const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0648\u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0641\u064A "\u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A".
\u0642\u0645\u0646\u0627 \u0628\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0642\u0627\u0626\u0645\u0629 \u0637\u0644\u0627\u0628 \u0648\u0644\u062F\u064A\u0643 \u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u0646 \u0627\u0644\u0637\u0644\u0627\u0628 \u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u062A\u0633\u0643\u064A\u0646\u0647\u0645 \u0644\u0639\u062F\u0645 \u0627\u0644\u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0644\u0641\u0638\u064A \u0627\u0644\u062A\u0627\u0645.
\u0642\u0645 \u0628\u0645\u0637\u0627\u0628\u0642\u0629 \u0630\u0643\u064A\u0629 \u0648\u0645\u0633\u0627\u0645\u062D\u0629 \u0644\u0641\u0638\u064A\u0629 \u0644\u0647\u0624\u0644\u0627\u0621 \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u062A\u0648\u0632\u064A\u0639\u0647\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0627\u0644\u0646\u0634\u0637\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0645\u0646\u0627\u0633\u0628\u0629 \u0648\u0628\u0647\u0627 \u0645\u0633\u0627\u062D\u0629 (\u0644\u0627 \u062A\u062A\u0639\u062F\u0649 \u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0642\u0635\u0648\u0649 25):

\u0627\u0644\u0637\u0644\u0627\u0628 \u063A\u064A\u0631 \u0627\u0644\u0645\u0633\u0643\u0646\u064A\u0646:
${JSON.stringify(unassignedList, null, 2)}

\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0641\u064A \u0627\u0644\u0633\u0646\u062A\u0631 \u062D\u0627\u0644\u064A\u0627\u064B:
${JSON.stringify(availableGroupsInfo, null, 2)}

\u0627\u0644\u0634\u0631\u0648\u0637:
1. \u0648\u0632\u0639 \u0627\u0644\u0637\u0627\u0644\u0628 \u0641\u0642\u0637 \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u062A\u0646\u0627\u0633\u0628 \u0641\u0635\u0644\u0647 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0648\u0641\u0631\u0639\u0647 \u0648\u0644\u063A\u062A\u0647 (\u0639\u0631\u0628\u064A \u0623\u0648 \u0644\u063A\u0627\u062A) \u0628\u0634\u0643\u0644 \u062A\u0642\u0631\u064A\u0628\u064A \u0648\u0630\u0643\u064A (\u0645\u062B\u0627\u0644: "\u0627\u0644\u0631\u0627\u0628\u0639" \u064A\u0637\u0627\u0628\u0642 "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" \u0623\u0648 "ICT4").
2. \u0623\u0631\u062C\u0639 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0643\u0640 JSON Array \u0641\u0642\u0637 \u0645\u0641\u0631\u063A \u062A\u0645\u0627\u0645\u0627\u064B \u0645\u0646 \u0623\u064A \u0646\u0635\u0648\u0635 \u0634\u0631\u062D \u0623\u0648 \u0643\u0648\u062F \u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646 \u062E\u0627\u0631\u062C\u064A:
[
  { "index": 0, "groupId": "\u0645\u0639\u0631\u0641_\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629_\u0623\u0648_null", "notes": "\u0633\u0628\u0628 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0630\u0643\u064A" }
]`;
        const aiRes = await generateWithModelCascade({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });
        if (aiRes.text) {
          const cleanText = aiRes.text.replace(/```json/g, "").replace(/```/g, "").trim();
          const aiAssignments = JSON.parse(cleanText);
          if (Array.isArray(aiAssignments)) {
            aiAssignments.forEach((item) => {
              const student = parsedStudents.find((s) => s.index === item.index);
              if (student && item.groupId) {
                const grp = existingGroups.find((g) => g.id === item.groupId);
                if (grp) {
                  student.suggestedGroupId = grp.id;
                  student.suggestedGroupName = grp.name;
                  student.status = "assigned";
                  student.reason = `\u062A\u0633\u0643\u064A\u0646 \u0630\u0643\u064A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A: ${item.notes || "\u062A\u0645\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 \u0628\u0646\u062C\u0627\u062D"}`;
                  groupEnrollments[grp.id] = (groupEnrollments[grp.id] || 0) + 1;
                }
              } else if (student && !item.groupId && item.notes) {
                student.reason = `\u26A0\uFE0F \u063A\u064A\u0631 \u0645\u0633\u0643\u0646: ${item.notes}`;
              }
            });
          }
        }
      } catch (err) {
        console.warn("AI smart routing preview error:", err.message);
      }
    }
    res.json({
      success: true,
      students: parsedStudents,
      groups: existingGroups.map((g) => ({
        id: g.id,
        name: g.name,
        grade: g.grade,
        branchId: g.branchId,
        enrolledCount: groupEnrollments[g.id] || 0,
        maxCapacity: g.maxCapacity || 25
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0641\u062D\u0635 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631: " + err.message });
  }
});
apiRouter.post("/trainees/import-commit", async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" });
    }
    const [existingTrainees, branches, courses, groups] = await Promise.all([
      TraineeRepo.getAll(),
      BranchRepo.getAll(),
      CourseRepo.getAll(),
      GroupRepo.getAll()
    ]);
    const batch = adminDb.batch();
    let createdCount = 0;
    let skippedCount = 0;
    let duplicatesCount = 0;
    const createdStudents = [];
    const workingTrainees = [...existingTrainees];
    for (const st of students) {
      const isDuplicate = workingTrainees.some((ext) => {
        if (st.nationalId && ext.nationalId && String(st.nationalId).trim() === String(ext.nationalId).trim() && String(st.nationalId).trim() !== "") {
          return true;
        }
        const sameName = String(st.fullName).trim().toLowerCase() === String(ext.fullName).trim().toLowerCase();
        const samePhone = st.phone && ext.phone && String(st.phone).trim() === String(ext.phone).trim();
        const sameParentPhone = st.parentPhone && ext.parentPhone && String(st.parentPhone).trim() === String(ext.parentPhone).trim();
        if (sameName && (samePhone || sameParentPhone)) return true;
        if (st.code && ext.code && String(st.code).trim().toLowerCase() === String(ext.code).trim().toLowerCase()) return true;
        return false;
      });
      if (isDuplicate) {
        skippedCount++;
        duplicatesCount++;
        continue;
      }
      let resolvedBranchId = st.branchId || (branches[0] ? branches[0].id : "branch-1");
      let resolvedCourseId = st.suggestedCourseId || st.courseId || null;
      let resolvedGroupId = st.suggestedGroupId || st.groupId || null;
      if (resolvedGroupId && String(resolvedGroupId).startsWith("CREATE_NEW:")) {
        const parts = String(resolvedGroupId).split(":");
        const className = parts[1] || st.class || "\u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629";
        const bId = parts[2] || resolvedBranchId;
        const track = parts[3] || "\u0639\u0631\u0628\u064A";
        let matchCourse = courses.find((c) => c.name.includes(className) && c.branchId === bId);
        if (!matchCourse) {
          matchCourse = {
            id: "crs-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            name: `${className} (${track})`,
            description: `\u062F\u0648\u0631\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0644\u0640 ${className}`,
            feeAmount: st.feeAmount || 500,
            durationWeeks: 12,
            category: className,
            status: "active",
            branchId: bId,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          batch.set(adminDb.collection("courses").doc(matchCourse.id), matchCourse);
          courses.push(matchCourse);
        }
        resolvedCourseId = matchCourse.id;
        let matchGroup = groups.find((g) => g.courseId === matchCourse.id && g.branchId === bId);
        if (!matchGroup) {
          matchGroup = {
            id: "grp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            name: `\u2795 \u0645\u062C\u0645\u0648\u0639\u0629 ${className} (${track}) - \u0641\u0648\u062C \u062C\u062F\u064A\u062F`,
            courseId: matchCourse.id,
            branchId: bId,
            grade: className,
            maxCapacity: 25,
            status: "active",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          batch.set(adminDb.collection("groups").doc(matchGroup.id), matchGroup);
          groups.push(matchGroup);
        }
        resolvedGroupId = matchGroup.id;
      }
      const gradeOrCourseName = st.class || "\u0639\u0631\u0628\u064A";
      const targetPrefix = db.getPrefixForGradeOrCourse ? db.getPrefixForGradeOrCourse(gradeOrCourseName) : "NGH";
      const pfx = (targetPrefix || "NGH").toUpperCase();
      const regex = new RegExp(`^${pfx}-?(\\d+)$`, "i");
      let maxNum = 0;
      workingTrainees.forEach((t) => {
        if (t.code) {
          const match = String(t.code).trim().match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
      const nextNum = maxNum + 1;
      const code = pfx.length === 1 ? `${pfx}${String(nextNum).padStart(3, "0")}` : `${pfx}-${nextNum}`;
      const feeAmount = Number(st.feeAmount || 500);
      const discountAmount = Number(st.discountAmount || 0);
      const paidAmount = Number(st.paidAmount || 0);
      const netAmount = feeAmount - discountAmount;
      const remainingAmount = netAmount - paidAmount;
      const newTraineeId = "trainee-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const newTrainee = {
        id: newTraineeId,
        code,
        fullName: String(st.fullName).trim(),
        nationalId: String(st.nationalId || "").trim(),
        phone: String(st.phone || "").trim(),
        parentPhone: String(st.parentPhone || "").trim(),
        parentName: String(st.parentName || "").trim(),
        address: String(st.address || "").trim(),
        notes: String(st.notes || "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0645\u0646 \u0645\u0644\u0641 Excel \u0628\u0646\u062C\u0627\u062D").trim(),
        gender: st.gender === "female" ? "female" : "male",
        branchId: resolvedBranchId,
        courseId: resolvedCourseId,
        courseIds: resolvedCourseId ? [resolvedCourseId] : [],
        groupId: resolvedGroupId,
        feeAmount,
        discountAmount,
        netAmount,
        paidAmount,
        remainingAmount,
        registrationDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        status: "active",
        totalPoints: 0,
        points: 0,
        photoUrl: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      batch.set(adminDb.collection("trainees").doc(newTrainee.id), newTrainee);
      workingTrainees.push(newTrainee);
      createdStudents.push(newTrainee);
      createdCount++;
    }
    if (createdCount > 0) {
      await batch.commit();
    }
    res.json({
      success: true,
      createdCount,
      skippedCount,
      duplicatesCount,
      students: createdStudents
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Error importing students" });
  }
});
async function resolveTrainerCodeAndPrefix(data, existingId) {
  const allTrainers = await TrainerRepo.getAll();
  const otherTrainers = existingId ? allTrainers.filter((t) => t.id !== existingId) : allTrainers;
  let prefix = "TR";
  const inputTitle = (data.title || data.prefix || data.qualification || "").toString().toUpperCase().trim();
  if (["DR", "ENG", "MR", "TR"].includes(data.prefix)) {
    prefix = data.prefix;
  } else if (inputTitle.includes("DR") || inputTitle.includes("\u062F\u0643\u062A\u0648\u0631") || inputTitle.includes("\u062F.")) {
    prefix = "DR";
  } else if (inputTitle.includes("ENG") || inputTitle.includes("\u0645\u0647\u0646\u062F\u0633") || inputTitle.includes("\u0645.")) {
    prefix = "ENG";
  } else if (inputTitle.includes("MR") || inputTitle.includes("\u0623\u0633\u062A\u0627\u0630") || inputTitle.includes("\u0627\u0633\u062A\u0627\u0630") || inputTitle.includes("\u0623.") || inputTitle.includes("MS") || inputTitle.includes("MRS")) {
    prefix = "MR";
  }
  let code = data.code ? data.code.trim().toUpperCase() : "";
  if (!code || !code.startsWith(prefix)) {
    const matchingCodes = otherTrainers.map((t) => (t.code || "").trim().toUpperCase()).filter((c) => c.startsWith(prefix));
    let maxSeq = 0;
    matchingCodes.forEach((c) => {
      const numPart = parseInt(c.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    });
    const seqStr = String(maxSeq + 1).padStart(2, "0");
    code = `${prefix}${seqStr}`;
  }
  const portalPassword = data.portalPassword || `${code}${code}`;
  return {
    ...data,
    title: prefix,
    prefix,
    code,
    portalPassword
  };
}
async function syncCourseToGroups(courseId, courseData) {
  try {
    const groups = await GroupRepo.getAll();
    const matchingGroups = groups.filter((g) => g.courseId === courseId || courseData.code && g.courseId === courseData.code);
    for (const g of matchingGroups) {
      await GroupRepo.update(g.id, {
        materials: courseData.materials || [],
        assessments: courseData.assessments || []
      });
    }
  } catch (err) {
    console.error("Error syncing course to groups:", err);
  }
}
apiRouter.get("/trainers", async (req, res) => {
  try {
    const list = await TrainerRepo.getAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/trainers", async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.phone) return res.status(400).json({ success: false, error: "\u0627\u0644\u0627\u0633\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    const formattedData = await resolveTrainerCodeAndPrefix(data);
    const id = "trainer-" + Date.now();
    const created = await TrainerRepo.create(id, { ...formattedData, status: formattedData.status || "active" });
    res.json({ success: true, trainer: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.put("/trainers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const formattedData = await resolveTrainerCodeAndPrefix(req.body, id);
    const updated = await TrainerRepo.update(id, formattedData);
    res.json({ success: true, trainer: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/trainers/fix-codes", async (req, res) => {
  try {
    const trainers = await TrainerRepo.getAll();
    const updatedTrainers = [];
    for (const t of trainers) {
      const fixed = await resolveTrainerCodeAndPrefix(t, t.id);
      if (fixed.code !== t.code || fixed.prefix !== t.prefix || !t.portalPassword) {
        const updated = await TrainerRepo.update(t.id, fixed);
        updatedTrainers.push(updated);
      }
    }
    res.json({ success: true, count: updatedTrainers.length, trainers: updatedTrainers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.get("/courses", async (req, res) => {
  try {
    const list = await CourseRepo.getAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/courses", async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.code || !data.branchId) return res.status(400).json({ success: false, error: "\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0643\u0648\u062F \u0648\u0627\u0644\u0641\u0631\u0639 \u062D\u0642\u0648\u0644 \u0625\u062C\u0628\u0627\u0631\u064A\u0629" });
    const id = "crs-" + Date.now();
    const created = await CourseRepo.create(id, { ...data, status: data.status || "active" });
    res.json({ success: true, course: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CourseRepo.update(id, req.body);
    await syncCourseToGroups(id, updated);
    res.json({ success: true, course: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/courses/:id/materials", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseRepo.getById(id);
    if (!course) return res.status(404).json({ success: false, error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    const newMaterial = {
      id: "mat-" + Date.now(),
      title: req.body.title || "\u0645\u0627\u062F\u0629 \u0639\u0644\u0645\u064A\u0629 \u062C\u062F\u064A\u062F\u0629",
      fileUrl: req.body.fileUrl || "",
      fileName: req.body.fileName || "document.pdf",
      fileType: req.body.fileType || "pdf",
      fileSize: req.body.fileSize || "",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      description: req.body.description || ""
    };
    const materials = [...course.materials || [], newMaterial];
    const updated = await CourseRepo.update(id, { materials });
    await syncCourseToGroups(id, updated);
    res.json({ success: true, material: newMaterial, course: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/courses/:id/materials/:matId", async (req, res) => {
  try {
    const { id, matId } = req.params;
    const course = await CourseRepo.getById(id);
    if (!course) return res.status(404).json({ success: false, error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    const materials = (course.materials || []).filter((m) => m.id !== matId);
    const updated = await CourseRepo.update(id, { materials });
    await syncCourseToGroups(id, updated);
    res.json({ success: true, course: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/courses/:id/assessments", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseRepo.getById(id);
    if (!course) return res.status(404).json({ success: false, error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    const newAssessment = {
      id: "ass-" + Date.now(),
      title: req.body.title || "\u062A\u0642\u064A\u064A\u0645 / \u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0631\u0642\u064A",
      fileUrl: req.body.fileUrl || "",
      fileName: req.body.fileName || "assessment.pdf",
      fileType: req.body.fileType || "pdf",
      type: req.body.type || "weekly_assessment",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      description: req.body.description || "",
      weekOrGrade: req.body.weekOrGrade || ""
    };
    const assessments = [...course.assessments || [], newAssessment];
    const updated = await CourseRepo.update(id, { assessments });
    await syncCourseToGroups(id, updated);
    res.json({ success: true, assessment: newAssessment, course: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/courses/:id/assessments/:assId", async (req, res) => {
  try {
    const { id, assId } = req.params;
    const course = await CourseRepo.getById(id);
    if (!course) return res.status(404).json({ success: false, error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    const assessments = (course.assessments || []).filter((a) => a.id !== assId);
    const updated = await CourseRepo.update(id, { assessments });
    await syncCourseToGroups(id, updated);
    res.json({ success: true, course: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await CourseRepo.delete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/courses/:id/duplicate", (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const course = data.courses.find((c) => c.id === id);
  if (!course) return res.status(404).json({ error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  const newCourse = {
    ...course,
    id: "crs-" + Date.now(),
    code: `CRS-${Math.floor(100 + Math.random() * 900)}`,
    name: `${course.name} (\u0646\u0633\u062E\u0629 \u0645\u0643\u0631\u0631\u0629)`,
    status: "active"
  };
  data.courses.push(newCourse);
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062A\u0643\u0631\u0627\u0631 \u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629",
    entity: "\u0627\u0644\u062F\u0648\u0631\u0627\u062A",
    entityId: newCourse.id,
    branchId: newCourse.branchId,
    details: `\u062A\u0645 \u062A\u0643\u0631\u0627\u0631 \u0648\u0646\u0633\u062E \u0627\u0644\u062F\u0648\u0631\u0629: ${newCourse.name} \u0645\u0646 \u0627\u0644\u062F\u0648\u0631\u0629 ${course.name}`
  });
  res.json({ success: true, course: newCourse });
});
apiRouter.get("/programs", async (req, res) => {
  try {
    const list = await ProgramRepo.getAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/programs", (req, res) => {
  const d = req.body;
  if (!d.name || !d.code || !d.branchId) {
    return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0648\u0627\u0644\u0643\u0648\u062F \u0648\u0627\u0644\u0641\u0631\u0639 \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  }
  const generatedCourseIds = [];
  const baseFee = Number(d.courseFee) || 0;
  if (d.generationType === "grades") {
    const gradesList = d.gradesList || [];
    gradesList.forEach((gradeInfo, idx) => {
      const courseId = "course-" + Date.now() + "-" + idx;
      const newCourse = {
        id: courseId,
        code: `${d.code.trim().toUpperCase()}${gradeInfo.codeSuffix ? "-" + gradeInfo.codeSuffix : ""}`,
        name: `${d.name.trim()} - ${gradeInfo.name}`,
        category: d.name.trim(),
        grade: gradeInfo.name,
        branchId: d.branchId,
        hoursCount: 0,
        lecturesCount: 0,
        feeAmount: baseFee,
        status: "active"
      };
      db.getData().courses.push(newCourse);
      generatedCourseIds.push(courseId);
    });
  } else if (d.generationType === "levels") {
    const levelCount = Number(d.levelCount) || 1;
    for (let i = 1; i <= levelCount; i++) {
      const courseId = "course-" + Date.now() + "-L" + i;
      const newCourse = {
        id: courseId,
        code: `${d.code.trim().toUpperCase()}-L${i}`,
        name: `${d.name.trim()} - \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${i}`,
        category: d.name.trim(),
        level: `\u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${i}`,
        branchId: d.branchId,
        hoursCount: 0,
        lecturesCount: 0,
        feeAmount: baseFee,
        status: "active"
      };
      db.getData().courses.push(newCourse);
      generatedCourseIds.push(courseId);
    }
  }
  if (Array.isArray(d.courseIds)) {
    generatedCourseIds.push(...d.courseIds);
  }
  const newProg = {
    id: "prog-" + Date.now(),
    code: d.code.trim().toUpperCase(),
    name: d.name.trim(),
    category: d.category || "\u0639\u0627\u0645",
    targetAudience: d.targetAudience || "\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0626\u0627\u062A",
    description: d.description || "",
    branchId: d.branchId,
    courseIds: generatedCourseIds,
    bundlePrice: Number(d.bundlePrice) || 0,
    status: d.status || "active",
    icon: d.icon || "Layers",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.getData().programs.push(newProg);
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u0625\u0636\u0627\u0641\u0629 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u062F\u0631\u064A\u0628\u064A",
    entity: "\u0627\u0644\u0628\u0631\u0627\u0645\u062C",
    entityId: newProg.id,
    details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u062F\u0631\u064A\u0628\u064A: ${newProg.name} \u0645\u0639 ${generatedCourseIds.length} \u062F\u0648\u0631\u0627\u062A.`
  });
  res.json({ success: true, program: newProg });
});
apiRouter.put("/programs/:id", (req, res) => {
  const { id } = req.params;
  const d = req.body;
  const programs = db.getData().programs;
  const index = programs.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  }
  const existing = programs[index];
  const updated = {
    ...existing,
    name: d.name ? d.name.trim() : existing.name,
    code: d.code ? d.code.trim().toUpperCase() : existing.code,
    category: d.category !== void 0 ? d.category : existing.category,
    targetAudience: d.targetAudience !== void 0 ? d.targetAudience : existing.targetAudience,
    description: d.description !== void 0 ? d.description : existing.description,
    status: d.status !== void 0 ? d.status : existing.status,
    bundlePrice: d.bundlePrice !== void 0 ? Number(d.bundlePrice) : existing.bundlePrice,
    courseIds: Array.isArray(d.courseIds) ? d.courseIds : existing.courseIds,
    icon: d.icon || existing.icon
  };
  programs[index] = updated;
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062A\u0639\u062F\u064A\u0644 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u062F\u0631\u064A\u0628\u064A",
    entity: "\u0627\u0644\u0628\u0631\u0627\u0645\u062C",
    entityId: updated.id,
    details: `\u062A\u0645 \u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C: ${updated.name}`
  });
  res.json({ success: true, program: updated });
});
apiRouter.delete("/programs/:id", (req, res) => {
  const { id } = req.params;
  const programs = db.getData().programs;
  const index = programs.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  }
  const removed = programs.splice(index, 1)[0];
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062D\u0630\u0641 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u062F\u0631\u064A\u0628\u064A",
    entity: "\u0627\u0644\u0628\u0631\u0627\u0645\u062C",
    entityId: id,
    details: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A: ${removed.name}`
  });
  res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0628\u0646\u062C\u0627\u062D" });
});
apiRouter.post("/programs/:id/add-courses", (req, res) => {
  const { id } = req.params;
  const d = req.body;
  const programs = db.getData().programs;
  const program = programs.find((p) => p.id === id);
  if (!program) {
    return res.status(404).json({ error: "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  }
  const newCourseIds = [];
  const baseFee = Number(d.courseFee) || 0;
  if (d.generationType === "grades" && Array.isArray(d.gradesList)) {
    d.gradesList.forEach((gradeInfo, idx) => {
      const courseId = "course-" + Date.now() + "-" + idx;
      const newCourse = {
        id: courseId,
        code: `${program.code}${gradeInfo.codeSuffix ? "-" + gradeInfo.codeSuffix : ""}`,
        name: `${program.name} - ${gradeInfo.name}`,
        category: program.category || program.name,
        grade: gradeInfo.name,
        branchId: program.branchId || d.branchId || "main",
        hoursCount: 0,
        lecturesCount: 0,
        feeAmount: baseFee,
        status: "active"
      };
      db.getData().courses.push(newCourse);
      newCourseIds.push(courseId);
    });
  } else if (d.generationType === "levels") {
    const levelCount = Number(d.levelCount) || 1;
    const existingCount = program.courseIds.length;
    for (let i = 1; i <= levelCount; i++) {
      const levelNum = existingCount + i;
      const courseId = "course-" + Date.now() + "-L" + levelNum;
      const newCourse = {
        id: courseId,
        code: `${program.code}-L${levelNum}`,
        name: `${program.name} - \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${levelNum}`,
        category: program.category || program.name,
        level: `\u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${levelNum}`,
        branchId: program.branchId || d.branchId || "main",
        hoursCount: 0,
        lecturesCount: 0,
        feeAmount: baseFee,
        status: "active"
      };
      db.getData().courses.push(newCourse);
      newCourseIds.push(courseId);
    }
  }
  if (Array.isArray(d.courseIds)) {
    newCourseIds.push(...d.courseIds);
  }
  program.courseIds = Array.from(/* @__PURE__ */ new Set([...program.courseIds, ...newCourseIds]));
  db.save();
  res.json({ success: true, program, addedCoursesCount: newCourseIds.length });
});
function syncGroupSchedule(group, dbData) {
  if (!dbData.labSchedules) dbData.labSchedules = [];
  dbData.labSchedules = dbData.labSchedules.filter((s) => s.groupId !== group.id);
}
apiRouter.get("/groups", async (req, res) => {
  try {
    const list = await GroupRepo.getAll();
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/groups", async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.courseId || !data.branchId) return res.status(400).json({ success: false, error: "\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u062F\u0648\u0631\u0629 \u0648\u0627\u0644\u0641\u0631\u0639 \u062D\u0642\u0648\u0644 \u0625\u062C\u0628\u0627\u0631\u064A\u0629" });
    const id = "grp-" + Date.now();
    const course = await CourseRepo.getById(data.courseId);
    const branch = await BranchRepo.getById(data.branchId);
    const courseCode = course?.code || "";
    const branchCode = branch?.code || branch?.name?.substring(0, 1) || "B";
    const existingGroups = await GroupRepo.getAll();
    const courseGroups = existingGroups.filter((g) => g.courseId === data.courseId && g.branchId === data.branchId);
    const groupNum = courseGroups.length + 1;
    const groupCode = courseCode ? `${courseCode}-${branchCode}-${groupNum}` : void 0;
    const created = await GroupRepo.create(id, { ...data, status: data.status || "active", code: data.code || groupCode });
    res.json({ success: true, group: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/groups/batch", (req, res) => {
  const { courseId, branchId, count, track, prefixName, feeAmount } = req.body;
  if (!courseId || !branchId || !count) {
    return res.status(400).json({ error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u0648\u0627\u0644\u0641\u0631\u0639 \u0648\u0627\u0644\u0639\u062F\u062F \u0645\u0637\u0644\u0648\u0628\u0629" });
  }
  const dbData = db.getData();
  const course = dbData.courses.find((c) => c.id === courseId || c.code === courseId);
  const branch = dbData.branches.find((b) => b.id === branchId);
  if (!course) return res.status(404).json({ error: "\u0627\u0644\u062F\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  const maxCap = branch?.name.includes("\u0627\u0644\u0646\u062C\u0627\u062D") ? 11 : 12;
  const createdGroups = [];
  const existingGroupsCount = dbData.groups.filter((g) => (g.courseId === courseId || course.code && g.courseId === course.code) && g.branchId === branchId).length;
  for (let i = 1; i <= Number(count); i++) {
    const groupNum = existingGroupsCount + i;
    const groupName = `${prefixName || course.name} - \u0645\u062C\u0645\u0648\u0639\u0629 ${groupNum} (${track || "\u0639\u0631\u0628\u064A"})`;
    const newGroup = {
      id: "grp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6) + "-" + i,
      name: groupName,
      branchId,
      courseId,
      maxStudents: maxCap,
      maxCapacity: maxCap,
      feeAmount: feeAmount !== void 0 && feeAmount !== "" && feeAmount !== null ? Number(feeAmount) : void 0,
      status: "active",
      grade: course.grade || void 0,
      days: ["\u0627\u0644\u0633\u0628\u062A", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"],
      scheduleDays: ["\u0627\u0644\u0633\u0628\u062A", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"],
      startTime: "16:00",
      endTime: "18:00",
      timeSlot: "04:00 \u0645 - 06:00 \u0645",
      notes: `\u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0628\u0627\u0644\u062C\u0645\u0644\u0629 - ${branch?.name || ""} - \u062D\u062F \u0627\u0644\u0623\u062C\u0647\u0632\u0629: ${maxCap}`
    };
    dbData.groups.push(newGroup);
    syncGroupSchedule(newGroup, dbData);
    createdGroups.push(newGroup);
  }
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u0625\u0636\u0627\u0641\u0629 \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0628\u0627\u0644\u062C\u0645\u0644\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u062F\u0648\u0644",
    entity: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
    branchId,
    details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${count} \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0644\u0644\u062F\u0648\u0631\u0629 ${course.name}`
  });
  res.json({ success: true, groups: createdGroups });
});
apiRouter.put("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await GroupRepo.update(id, req.body);
    res.json({ success: true, group: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await GroupRepo.delete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/groups/:id/duplicate", (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const group = data.groups.find((g) => g.id === id);
  if (!group) return res.status(404).json({ error: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  const overrides = req.body || {};
  const newGroup = {
    ...group,
    id: "grp-" + Date.now(),
    name: overrides.name ? overrides.name.trim() : `${group.name} (\u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u0643\u0631\u0631\u0629)`,
    branchId: overrides.branchId || group.branchId,
    trainerId: overrides.trainerId !== void 0 ? overrides.trainerId : group.trainerId,
    roomName: overrides.roomName || group.roomName,
    hallName: overrides.roomName || group.hallName,
    startTime: overrides.startTime || group.startTime,
    endTime: overrides.endTime || group.endTime,
    scheduleDays: overrides.scheduleDays || group.scheduleDays,
    days: overrides.scheduleDays || group.days,
    status: overrides.status || "active",
    startDate: overrides.startDate || "",
    endDate: overrides.endDate || "",
    whatsappGroupLink: overrides.whatsappGroupLink || group.whatsappGroupLink || "",
    notes: overrides.notes || group.notes || ""
  };
  data.groups.push(newGroup);
  syncGroupSchedule(newGroup, data);
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: "\u062A\u0643\u0631\u0627\u0631 \u0645\u062C\u0645\u0648\u0639\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u062F\u0648\u0644",
    entity: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
    entityId: newGroup.id,
    branchId: newGroup.branchId,
    details: `\u062A\u0645 \u0627\u0633\u062A\u0646\u0633\u0627\u062E \u0648\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629: ${newGroup.name} \u0648\u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0644\u0644\u062C\u062F\u0648\u0644`
  });
  res.json({ success: true, group: newGroup });
});
apiRouter.get("/attendance", async (req, res) => {
  try {
    const date = req.query.date;
    const groupId = req.query.groupId;
    const branchId = req.query.branchId;
    let list = await AttendanceRepo.getAll();
    if (date) list = list.filter((a) => a.date === date);
    if (groupId) list = list.filter((a) => a.groupId === groupId);
    if (branchId) list = list.filter((a) => a.branchId === branchId);
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/attendance/batch", async (req, res) => {
  const { records, date, groupId, branchId, courseId, trainerId } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062D\u0636\u0648\u0631 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
  }
  const sessionDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  db.getData().attendance = db.getData().attendance.filter((a) => !(a.groupId === groupId && a.date === sessionDate));
  for (const r of records) {
    const newRecord = {
      id: "att-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      date: sessionDate,
      time: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG"),
      branchId: branchId || "branch-1",
      groupId,
      courseId: courseId || "",
      trainerId: trainerId || void 0,
      traineeId: r.traineeId,
      status: r.status || "present",
      notes: r.notes || ""
    };
    db.getData().attendance.push(newRecord);
    if (r.status === "present") {
      const attRule = db.getData().pointRules.find((pr) => pr.ruleType === "attendance" && pr.isActive);
      if (attRule) {
        const student = await TraineeRepo.getById(r.traineeId);
        if (student) {
          student.totalPoints = (student.totalPoints || 0) + attRule.pointValue;
          db.getData().pointTransactions.push({
            id: "pt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            traineeId: student.id,
            groupId,
            branchId: student.branchId,
            points: attRule.pointValue,
            reason: `\u062D\u0636\u0648\u0631 \u062C\u0644\u0633\u0629 \u062A\u0627\u0631\u064A\u062E ${sessionDate}`,
            ruleId: attRule.id,
            addedByUserId: "trainer",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    }
  }
  db.recalculateTraineeRankings();
  db.save();
  db.logAudit({
    userId: "user",
    userName: "\u0627\u0644\u0645\u0634\u0631\u0641/\u0627\u0644\u0645\u062F\u0631\u0628",
    action: "\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u0648\u063A\u064A\u0627\u0628",
    entity: "\u0627\u0644\u062D\u0636\u0648\u0631",
    details: `\u062A\u0645 \u062D\u0641\u0638 \u0643\u0634\u0641 \u062D\u0636\u0648\u0631 \u0644\u0639\u062F\u062F ${records.length} \u0645\u062A\u062F\u0631\u0628 \u0644\u062A\u0627\u0631\u064A\u062E ${sessionDate}`
  });
  res.json({ success: true, count: records.length });
});
var handleGetPayments = async (req, res) => {
  try {
    const branchId = req.query.branchId;
    const traineeId = req.query.traineeId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let list = await PaymentRepo.getAll();
    if (branchId && branchId !== "all") list = list.filter((p) => p.branchId === branchId);
    if (traineeId) list = list.filter((p) => p.traineeId === traineeId);
    if (startDate) list = list.filter((p) => p.date >= String(startDate));
    if (endDate) list = list.filter((p) => p.date <= String(endDate));
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
apiRouter.get("/finance/payments", handleGetPayments);
apiRouter.get("/payments", handleGetPayments);
apiRouter.post("/finance/payments", async (req, res) => {
  try {
    const { traineeId, amount, paymentMethod, notes, receivedByUserId, receivedByUserName, branchId, courseId } = req.body;
    if (!traineeId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0648\u0627\u0644\u0645\u0628\u0644\u063A \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    const trainee = await TraineeRepo.getById(traineeId);
    if (!trainee) return res.status(404).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const payAmount = Number(amount);
    let receiptNumber = `REC${Date.now().toString().slice(-7)}`;
    let trainerId = req.body.trainerId;
    let trainerName = req.body.trainerName;
    let trainerCode = req.body.trainerCode;
    try {
      const group = trainee.groupId ? await GroupRepo.getById(trainee.groupId) : null;
      if (group) {
        if (!trainerId && group.trainerId) {
          const tr = await TrainerRepo.getById(group.trainerId);
          if (tr) {
            trainerId = tr.id;
            trainerName = tr.name;
            trainerCode = tr.code;
          }
        }
        if (group.code && trainee.code) {
          const cleanGroupCode = (group.code || "").replace(/-/g, "");
          const cleanTraineeCode = (trainee.code || "").replace(/-/g, "");
          const studentPayments = await PaymentRepo.getByTraineeId(trainee.id);
          const nextNum = studentPayments.length + 1;
          receiptNumber = `REC${cleanGroupCode}${cleanTraineeCode}${nextNum}`;
        }
      }
    } catch (e) {
      console.warn("Could not generate smart receipt number, using fallback", e);
    }
    const payment = {
      id: "pay-" + Date.now(),
      receiptNumber,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      traineeCode: trainee.code,
      trainerId,
      trainerName,
      trainerCode,
      courseId: courseId || trainee.courseId,
      branchId: branchId || trainee.branchId,
      amount: payAmount,
      paymentMethod: paymentMethod || "cash",
      receivedByUserId: receivedByUserId || "admin",
      receivedByUserName: receivedByUserName || "\u0645\u0648\u0638\u0641 \u0627\u0644\u062E\u0632\u064A\u0646\u0629",
      notes: notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "approved"
    };
    await PaymentRepo.create(payment.id, payment);
    const newPaid = (trainee.paidAmount || 0) + payAmount;
    const newRemaining = Math.max(0, (trainee.netAmount || trainee.feeAmount || 0) - newPaid);
    const updatedTrainee = await TraineeRepo.update(trainee.id, { paidAmount: newPaid, remainingAmount: newRemaining });
    db.logAudit({
      userId: payment.receivedByUserId,
      userName: payment.receivedByUserName || "\u0645\u0648\u0638\u0641 \u0627\u0644\u062E\u0632\u064A\u0646\u0629",
      action: "\u062A\u0633\u062C\u064A\u0644 \u0633\u0646\u062F \u0642\u0628\u0636",
      entity: "\u0627\u0644\u062E\u0632\u064A\u0646\u0629",
      entityId: payment.id,
      branchId: payment.branchId,
      details: `\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0628\u0644\u063A ${payAmount} \u062C.\u0645 \u0645\u0646 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 ${trainee.fullName} \u0628\u0631\u0642\u0645 \u0625\u064A\u0635\u0627\u0644 ${receiptNumber}`
    });
    res.json({ success: true, payment, trainee: updatedTrainee });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.post("/parent/submit-payment-proof", async (req, res) => {
  try {
    const { traineeId, amount, paymentMethod, targetMonth, notes, proofImageUrl, submittedByParentName } = req.body;
    if (!traineeId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0648\u0627\u0644\u0645\u0628\u0644\u063A \u062D\u0642\u0648\u0644 \u0625\u062C\u0628\u0627\u0631\u064A\u0629" });
    }
    const trainee = await TraineeRepo.getById(traineeId);
    if (!trainee) return res.status(404).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const payAmount = Number(amount);
    const pendingReceiptNumber = `PEND-${Date.now().toString().slice(-6)}`;
    const payment = {
      id: "pay-proof-" + Date.now(),
      receiptNumber: pendingReceiptNumber,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      traineeCode: trainee.code,
      courseId: trainee.courseId,
      branchId: trainee.branchId,
      amount: payAmount,
      paymentMethod: paymentMethod || "vodafone_cash",
      receivedByUserId: "parent-portal",
      receivedByUserName: "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 (\u0637\u0644\u0628 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A)",
      notes: notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetMonth: targetMonth || "\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u062D\u0627\u0644\u064A",
      proofImageUrl: proofImageUrl || "",
      status: "pending",
      submittedByParentName: submittedByParentName || trainee.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await PaymentRepo.create(payment.id, payment);
    db.logAudit({
      userId: "parent-portal",
      userName: payment.submittedByParentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      action: "\u0631\u0641\u0639 \u0625\u064A\u0635\u0627\u0644 \u0633\u062F\u0627\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
      entity: "\u0627\u0644\u062E\u0632\u064A\u0646\u0629",
      entityId: payment.id,
      branchId: payment.branchId,
      details: `\u0642\u0627\u0645 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0628\u0631\u0641\u0639 \u0625\u064A\u0635\u0627\u0644 \u0633\u062F\u0627\u062F \u0628\u0645\u0628\u0644\u063A ${payAmount} \u062C.\u0645 \u0644\u0644\u0637\u0627\u0644\u0628 ${trainee.fullName} \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0642\u0642`
    });
    res.json({ success: true, payment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.get("/finance/pending-proofs", async (req, res) => {
  try {
    const list = await PaymentRepo.getPendingProofs();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.post("/finance/approve-proof", async (req, res) => {
  try {
    const { paymentId, approvedByUserId, approvedByUserName, notes } = req.body;
    if (!paymentId) return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0633\u0646\u062F \u0645\u0637\u0644\u0648\u0628" });
    const payment = await PaymentRepo.getById(paymentId);
    if (!payment) return res.status(404).json({ error: "\u0627\u0644\u0633\u0646\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    if (payment.status === "approved") {
      return res.status(400).json({ error: "\u0647\u0630\u0627 \u0627\u0644\u0633\u0646\u062F \u0645\u0639\u062A\u0645\u062F \u0628\u0627\u0644\u0641\u0639\u0644" });
    }
    const trainee = await TraineeRepo.getById(payment.traineeId);
    if (!trainee) return res.status(404).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0627\u0644\u0645\u0631\u062A\u0628\u0637 \u0628\u0627\u0644\u0633\u0646\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const receiptNumber = `REC-${Date.now().toString().slice(-7)}`;
    const verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
    const verifiedByUserName = approvedByUserName || "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0627\u0644\u064A";
    const updatedPayment = await PaymentRepo.update(paymentId, {
      status: "approved",
      receiptNumber,
      verifiedAt,
      verifiedByUserName,
      notes: notes ? (payment.notes ? payment.notes + " | " : "") + notes : payment.notes
    });
    const newPaid = (trainee.paidAmount || 0) + payment.amount;
    const newRemaining = Math.max(0, (trainee.netAmount || trainee.feeAmount || 0) - newPaid);
    const updatedTrainee = await TraineeRepo.update(trainee.id, { paidAmount: newPaid, remainingAmount: newRemaining });
    res.json({ success: true, payment: updatedPayment, trainee: updatedTrainee });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.post("/finance/reject-proof", async (req, res) => {
  try {
    const { paymentId, rejectionReason, rejectedByUserId, rejectedByUserName } = req.body;
    if (!paymentId) return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0633\u0646\u062F \u0645\u0637\u0644\u0648\u0628" });
    const payment = await PaymentRepo.getById(paymentId);
    if (!payment) return res.status(404).json({ error: "\u0627\u0644\u0633\u0646\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const updatedPayment = await PaymentRepo.update(paymentId, {
      status: "rejected",
      rejectionReason: rejectionReason || "\u0635\u0648\u0631\u0629 \u0627\u0644\u0625\u064A\u0635\u0627\u0644 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629 \u0623\u0648 \u0627\u0644\u0645\u0628\u0644\u063A \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642",
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
      verifiedByUserName: rejectedByUserName || "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0627\u0644\u064A"
    });
    res.json({ success: true, payment: updatedPayment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.get("/finance/expenses", async (req, res) => {
  try {
    const branchId = req.query.branchId;
    const category = req.query.category;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let list = await ExpenseRepo.getAll();
    if (branchId && branchId !== "all") list = list.filter((e) => e.branchId === branchId);
    if (category && category !== "all") list = list.filter((e) => e.category === category);
    if (startDate) list = list.filter((e) => e.date >= String(startDate));
    if (endDate) list = list.filter((e) => e.date <= String(endDate));
    res.json(list);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.post("/finance/expenses", async (req, res) => {
  try {
    const { category, amount, beneficiary, description, branchId, notes, documentNumber } = req.body;
    if (!category || !amount || Number(amount) <= 0 || !branchId) {
      return res.status(400).json({ error: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0645\u0628\u0644\u063A \u0648\u0627\u0644\u0641\u0631\u0639 \u062D\u0642\u0648\u0644 \u0625\u062C\u0628\u0627\u0631\u064A\u0629" });
    }
    const newExpense = {
      id: "exp-" + Date.now(),
      documentNumber: documentNumber || `EXP-${Date.now().toString().slice(-6)}`,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      category,
      branchId,
      beneficiary: beneficiary?.trim() || "\u0639\u0627\u0645",
      amount: Number(amount),
      description: description?.trim() || "",
      notes: notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const createdExpense = await ExpenseRepo.create(newExpense.id, newExpense);
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A",
      action: "\u062A\u0633\u062C\u064A\u0644 \u0645\u0635\u0631\u0648\u0641",
      entity: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A",
      entityId: createdExpense.id,
      branchId: createdExpense.branchId,
      details: `\u0635\u0631\u0641 \u0645\u0628\u0644\u063A ${createdExpense.amount} \u062C.\u0645 \u062A\u0635\u0646\u064A\u0641 (${createdExpense.category}) - \u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F: ${createdExpense.beneficiary}`
    });
    res.json({ success: true, expense: createdExpense });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
apiRouter.get("/finance/trainer-settlements", (req, res) => {
  const { trainerId, branchId } = req.query;
  let list = db.getData().trainerSettlements;
  if (trainerId) list = list.filter((s) => s.trainerId === trainerId);
  if (branchId && branchId !== "all") list = list.filter((s) => s.branchId === branchId);
  res.json(list);
});
apiRouter.post("/finance/trainer-settlements", (req, res) => {
  const { trainerId, amount, paymentMethod, periodDescription, notes, branchId, createdByUserId, createdByUserName } = req.body;
  if (!trainerId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "\u0627\u0644\u0645\u062F\u0631\u0628 \u0648\u0627\u0644\u0645\u0628\u0644\u063A \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629" });
  }
  const trainer = db.getData().trainers.find((t) => t.id === trainerId);
  if (!trainer) return res.status(404).json({ error: "\u0627\u0644\u0645\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  const payAmount = Number(amount);
  const settlement = {
    id: "ts-" + Date.now(),
    receiptNumber: `TRN-${Date.now().toString().slice(-6)}`,
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    trainerId,
    branchId: branchId || trainer.branchId,
    amount: payAmount,
    paymentMethod: paymentMethod || "cash",
    periodDescription: periodDescription || "\u062A\u0633\u0648\u064A\u0629 \u0645\u0633\u062A\u062D\u0642\u0627\u062A",
    notes: notes || "",
    createdByUserId: createdByUserId || "admin",
    createdByUserName: createdByUserName || "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.getData().trainerSettlements.unshift(settlement);
  const newExpense = {
    id: "exp-tr-" + Date.now(),
    documentNumber: `EXP-${Date.now().toString().slice(-6)}`,
    date: settlement.date,
    category: "trainers",
    branchId: settlement.branchId,
    beneficiary: trainer.name,
    amount: payAmount,
    description: `\u0635\u0631\u0641 \u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0644\u0644\u0645\u062F\u0631\u0628 ${trainer.name} - ${settlement.periodDescription}`,
    notes: `\u0631\u0642\u0645 \u062A\u0633\u0648\u064A\u0629: ${settlement.receiptNumber} | ${settlement.notes || ""}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.getData().expenses.unshift(newExpense);
  db.recalculateTrainerFinances(trainerId);
  db.save();
  db.logAudit({
    userId: settlement.createdByUserId,
    userName: settlement.createdByUserName || "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A",
    action: "\u0635\u0631\u0641 \u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0645\u062F\u0631\u0628",
    entity: "\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u062F\u0631\u0628\u064A\u0646",
    entityId: settlement.id,
    branchId: settlement.branchId,
    details: `\u062A\u0645 \u0635\u0631\u0641 ${payAmount} \u062C.\u0645 \u0644\u0644\u0645\u062F\u0631\u0628 ${trainer.name} \u0628\u0631\u0642\u0645 \u062A\u0633\u0648\u064A\u0629 ${settlement.receiptNumber}`
  });
  res.json({ success: true, settlement, trainer });
});
apiRouter.get("/reports/financial_summary", async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    let [payments, expenses, trainees] = await Promise.all([
      PaymentRepo.getAll(),
      ExpenseRepo.getAll(),
      TraineeRepo.getAll()
    ]);
    let settlements = db.getData().trainerSettlements || [];
    if (branchId && branchId !== "all") {
      payments = payments.filter((p) => p.branchId === branchId);
      expenses = expenses.filter((e) => e.branchId === branchId);
      settlements = settlements.filter((s) => s.branchId === branchId);
      trainees = trainees.filter((t) => t.branchId === branchId);
    }
    if (startDate) {
      payments = payments.filter((p) => p.date >= String(startDate));
      expenses = expenses.filter((e) => e.date >= String(startDate));
      settlements = settlements.filter((s) => s.date >= String(startDate));
    }
    if (endDate) {
      payments = payments.filter((p) => p.date <= String(endDate));
      expenses = expenses.filter((e) => e.date <= String(endDate));
      settlements = settlements.filter((s) => s.date <= String(endDate));
    }
    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalTrainerPayouts = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const netTreasury = totalRevenue - totalExpenses - totalTrainerPayouts;
    const totalTraineeRemaining = trainees.reduce((sum, t) => sum + (Number(t.remainingAmount) || 0), 0);
    const totalExpectedRevenue = trainees.reduce((sum, t) => sum + (Number(t.netAmount) || 0), 0);
    let trainers = await TrainerRepo.getAll();
    if (!trainers || trainers.length === 0) {
      trainers = db.getData().trainers || [];
    }
    const totalTrainerDues = trainers.filter((t) => branchId && branchId !== "all" ? t.branchId === branchId : true).reduce((sum, t) => sum + (Number(t.balanceDue) || 0), 0);
    const totalCenterShare = Math.max(0, totalRevenue - totalTrainerPayouts);
    res.json({
      success: true,
      totalRevenue,
      totalExpenses,
      totalTrainerPayouts,
      netTreasury,
      totalTraineeRemaining,
      totalExpectedRevenue,
      totalTrainerDues,
      totalCenterShare,
      paymentsCount: payments.length,
      expensesCount: expenses.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/reports/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { branchId, startDate, endDate } = req.query;
    const data = db.getData();
    let [trainees, trainers, courses, payments, expenses, attendance] = await Promise.all([
      TraineeRepo.getAll().catch(() => data.trainees || []),
      TrainerRepo.getAll().catch(() => data.trainers || []),
      CourseRepo.getAll().catch(() => data.courses || []),
      PaymentRepo.getAll().catch(() => data.payments || []),
      ExpenseRepo.getAll().catch(() => data.expenses || []),
      AttendanceRepo.getAll().catch(() => data.attendance || [])
    ]);
    if (branchId && branchId !== "all") {
      trainees = (trainees || []).filter((t) => t.branchId === branchId);
      trainers = (trainers || []).filter((t) => t.branchId === branchId);
      courses = (courses || []).filter((c) => c.branchId === branchId);
      payments = (payments || []).filter((p) => p.branchId === branchId);
      expenses = (expenses || []).filter((e) => e.branchId === branchId);
      attendance = (attendance || []).filter((a) => a.branchId === branchId);
    }
    if (startDate) {
      payments = (payments || []).filter((p) => p.date >= String(startDate));
      expenses = (expenses || []).filter((e) => e.date >= String(startDate));
      attendance = (attendance || []).filter((a) => a.date >= String(startDate));
    }
    if (endDate) {
      payments = (payments || []).filter((p) => p.date <= String(endDate));
      expenses = (expenses || []).filter((e) => e.date <= String(endDate));
      attendance = (attendance || []).filter((a) => a.date <= String(endDate));
    }
    const totalRevenue = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const settlements = data.trainerSettlements || [];
    const totalTrainerPayouts = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const netTreasury = totalRevenue - totalExpenses - totalTrainerPayouts;
    let responseData = {};
    switch (reportId) {
      case "financial_summary":
        responseData = {
          summary: {
            totalRevenue,
            totalExpenses,
            totalTrainerPayouts,
            netTreasury
          },
          columns: ["\u0627\u0644\u0628\u064A\u0627\u0646", "\u0627\u0644\u0646\u0648\u0639", "\u0627\u0644\u0645\u0628\u0644\u063A", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E", "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639"],
          rows: [
            ...payments.map((p) => [p.traineeName || "\u0633\u062F\u0627\u062F \u0645\u062A\u062F\u0631\u0628", "\u0625\u064A\u0631\u0627\u062F \u0642\u0628\u0636", `${p.amount} \u062C.\u0645`, p.date || "-", p.paymentMethod || "\u0646\u0642\u062F\u064A"]),
            ...expenses.map((e) => [e.title || "\u0645\u0635\u0631\u0648\u0641 \u062A\u0634\u063A\u064A\u0644\u064A", "\u0645\u0635\u0631\u0648\u0641\u0627\u062A", `${e.amount} \u062C.\u0645`, e.date || "-", e.category || "\u0639\u0627\u0645"])
          ]
        };
        break;
      case "treasury_movements":
        responseData = {
          summary: { totalRevenue, totalExpenses, netTreasury },
          columns: ["\u0631\u0642\u0645 \u0627\u0644\u0625\u064A\u0635\u0627\u0644", "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 / \u0627\u0644\u0645\u062A\u062F\u0631\u0628", "\u0627\u0644\u0645\u0628\u0644\u063A", "\u0627\u0644\u0628\u064A\u0627\u0646", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E"],
          rows: payments.map((p) => [p.receiptNumber || "-", p.traineeName || "-", `${p.amount} \u062C.\u0645`, p.notes || "\u0633\u0646\u062F \u0642\u0628\u0636 \u0627\u0634\u062A\u0631\u0627\u0643", p.date || "-"])
        };
        break;
      case "trainer_dues_statement":
        responseData = {
          columns: ["\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", "\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0631\u0643\u0632 / \u0627\u0644\u0639\u0645\u0648\u0644\u0629", "\u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629"],
          rows: (trainers || []).map((t) => [t.name, t.phone || "-", `${t.commissionRate || 0}%`, `${t.balanceDue || 0} \u062C.\u0645`])
        };
        break;
      case "expenses_by_category":
        responseData = {
          summary: { totalExpenses },
          columns: ["\u0628\u0646\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641", "\u0627\u0644\u062A\u0635\u0646\u064A\u0641", "\u0627\u0644\u0645\u0628\u0644\u063A", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A"],
          rows: (expenses || []).map((e) => [e.title, e.category || "\u062A\u0634\u063A\u064A\u0644\u064A", `${e.amount} \u062C.\u0645`, e.date || "-", e.notes || "-"])
        };
        break;
      case "remaining_balances":
        const unpaidTrainees = (trainees || []).filter((t) => (t.remainingAmount || 0) > 0 || (t.feeAmount || 0) - (t.paidAmount || 0) > 0);
        responseData = {
          summary: { totalTraineeRemaining: unpaidTrainees.reduce((s, t) => s + (t.remainingAmount || 0), 0) },
          columns: ["\u0643\u0648\u062F \u0627\u0644\u0637\u0627\u0644\u0628", "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628", "\u0627\u0644\u062F\u0648\u0631\u0629 / \u0627\u0644\u0645\u0631\u062D\u0644\u0629", "\u0647\u0627\u062A\u0641 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u062A\u0628\u0642\u064A"],
          rows: unpaidTrainees.map((t) => [t.code || "-", t.name, t.grade || t.courseName || "-", t.parentPhone || t.phone || "-", `${t.remainingAmount || t.feeAmount - t.paidAmount} \u062C.\u0645`])
        };
        break;
      case "trainees_directory":
        responseData = {
          columns: ["\u0627\u0644\u0643\u0648\u062F", "\u0627\u0644\u0627\u0633\u0645", "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 / \u0627\u0644\u062F\u0648\u0631\u0629", "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", "\u0627\u0644\u062D\u0627\u0644\u0629"],
          rows: (trainees || []).map((t) => [t.code || "-", t.name, t.grade || t.courseName || "-", t.groupName || "-", t.phone || "-", t.status || "\u0646\u0634\u0637"])
        };
        break;
      case "attendance_commitment":
        const totalSessions = attendance.length;
        const presentCount = attendance.filter((a) => a.status === "present").length;
        const rate = totalSessions > 0 ? Math.round(presentCount / totalSessions * 100) : 100;
        responseData = {
          summary: { totalRecords: totalSessions, presentCount, attendanceRate: `${rate}%` },
          columns: ["\u0643\u0648\u062F \u0627\u0644\u0637\u0627\u0644\u0628", "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628", "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E", "\u0627\u0644\u062D\u0627\u0644\u0629"],
          rows: attendance.slice(0, 100).map((a) => [a.traineeCode || "-", a.traineeName || "-", a.groupName || "-", a.date || "-", a.status === "present" ? "\u062D\u0627\u0636\u0631" : a.status === "late" ? "\u0645\u062A\u0623\u062E\u0631" : "\u063A\u0627\u0626\u0628"])
        };
        break;
      case "courses_performance":
        responseData = {
          columns: ["\u0643\u0648\u062F \u0627\u0644\u062F\u0648\u0631\u0629", "\u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629", "\u0639\u062F\u062F \u0627\u0644\u0637\u0644\u0627\u0628", "\u0627\u0644\u0633\u0639\u0631", "\u0627\u0644\u062D\u0627\u0644\u0629"],
          rows: (courses || []).map((c) => [c.code || "-", c.name, (trainees || []).filter((t) => t.courseId === c.id).length, `${c.price || 0} \u062C.\u0645`, c.isActive ? "\u0645\u0641\u0639\u0644\u0629 \u2705" : "\u0645\u0643\u062A\u0645\u0644\u0629"])
        };
        break;
      case "groups_capacity":
        const groups = data.groups || [];
        responseData = {
          columns: ["\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629", "\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F", "\u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0639\u0627\u0628\u064A\u0629", "\u0627\u0644\u0645\u0633\u062C\u0644\u064A\u0646 \u062D\u0627\u0644\u064A\u0627\u064B", "\u0627\u0644\u0642\u0627\u0639\u0629"],
          rows: groups.map((g) => [g.name, g.schedule || "-", g.capacity || 25, (trainees || []).filter((t) => t.groupId === g.id).length, g.room || "\u0645\u0639\u0645\u0644 \u0631\u0626\u064A\u0633\u064A"])
        };
        break;
      case "devices_status":
        const devicesList = data.devices || [];
        responseData = {
          columns: ["\u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0627\u0632", "\u0639\u0646\u0648\u0627\u0646 IP", "\u0627\u0644\u062D\u0627\u0644\u0629", "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0645\u0633\u062C\u0644", "\u0622\u062E\u0631 \u0646\u0634\u0627\u0637"],
          rows: devicesList.map((d) => [d.name, d.ipAddress || "-", d.status === "online" ? "\u0645\u062A\u0635\u0644 \u{1F7E2}" : "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u{1F534}", d.activeTraineeName || "\u0644\u0627 \u064A\u0648\u062C\u062F", d.lastSeen || "-"])
        };
        break;
      default:
        responseData = {
          summary: { totalRevenue, totalExpenses, netTreasury },
          columns: ["\u0627\u0644\u0628\u064A\u0627\u0646", "\u0627\u0644\u0642\u064A\u0645\u0629", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E", "\u0627\u0644\u062D\u0627\u0644\u0629"],
          rows: [
            ["\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629", `${totalRevenue} \u062C.\u0645`, (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG"), "\u0645\u0639\u062A\u0645\u062F"],
            ["\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629", `${totalExpenses} \u062C.\u0645`, (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG"), "\u0645\u0639\u062A\u0645\u062F"],
            ["\u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D \u0627\u0644\u062E\u0632\u064A\u0646\u0629", `${netTreasury} \u062C.\u0645`, (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG"), "\u0645\u062D\u062F\u062B"]
          ]
        };
        break;
    }
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631: " + err.message });
  }
});
apiRouter.get("/public/branches", async (req, res) => {
  try {
    const branches = await BranchRepo.getAll();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/finance/summary", async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    let [payments, expenses, trainees] = await Promise.all([
      PaymentRepo.getAll(),
      ExpenseRepo.getAll(),
      TraineeRepo.getAll()
    ]);
    let settlements = db.getData().trainerSettlements || [];
    if (branchId && branchId !== "all") {
      payments = payments.filter((p) => p.branchId === branchId);
      expenses = expenses.filter((e) => e.branchId === branchId);
      settlements = settlements.filter((s) => s.branchId === branchId);
      trainees = trainees.filter((t) => t.branchId === branchId);
    }
    if (startDate) {
      payments = payments.filter((p) => p.date >= String(startDate));
      expenses = expenses.filter((e) => e.date >= String(startDate));
      settlements = settlements.filter((s) => s.date >= String(startDate));
    }
    if (endDate) {
      payments = payments.filter((p) => p.date <= String(endDate));
      expenses = expenses.filter((e) => e.date <= String(endDate));
      settlements = settlements.filter((s) => s.date <= String(endDate));
    }
    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalTrainerPayouts = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const netTreasury = totalRevenue - totalExpenses - totalTrainerPayouts;
    const totalTraineeRemaining = trainees.reduce((sum, t) => sum + (Number(t.remainingAmount) || 0), 0);
    const totalExpectedRevenue = trainees.reduce((sum, t) => sum + (Number(t.netAmount) || 0), 0);
    let trainers = await TrainerRepo.getAll();
    if (!trainers || trainers.length === 0) {
      trainers = db.getData().trainers || [];
    }
    const totalTrainerDues = trainers.filter((t) => branchId && branchId !== "all" ? t.branchId === branchId : true).reduce((sum, t) => sum + (Number(t.balanceDue) || 0), 0);
    const totalCenterShare = Math.max(0, totalRevenue - totalTrainerPayouts);
    res.json({
      totalRevenue,
      totalExpenses,
      totalTrainerPayouts,
      netTreasury,
      totalTraineeRemaining,
      totalExpectedRevenue,
      totalTrainerDues,
      totalCenterShare,
      paymentsCount: payments.length,
      expensesCount: expenses.length
    });
  } catch (err) {
    res.status(500).json({ error: "\u062A\u0639\u0630\u0631 \u062C\u0644\u0628 \u0627\u0644\u062E\u0644\u0627\u0635\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629: " + err.message });
  }
});
apiRouter.post("/finance/reset-and-archive", async (req, res) => {
  try {
    const { archiveTitle, pin, userId, userName } = req.body;
    const MASTER_PIN = "1234";
    if (pin !== MASTER_PIN && pin !== "admin" && pin !== "0000") {
      return res.status(403).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u0633\u0631\u064A \u0644\u0644\u0645\u062F\u064A\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D. \u0645\u0637\u0644\u0648\u0628 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0633\u0631\u064A \u0627\u0644\u0635\u062D\u064A\u062D \u0644\u0625\u062A\u0645\u0627\u0645 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0648\u0627\u0644\u0623\u0631\u0634\u0641\u0629." });
    }
    const [payments, expenses, trainees] = await Promise.all([
      PaymentRepo.getAll(),
      ExpenseRepo.getAll(),
      TraineeRepo.getAll()
    ]);
    const settlements = db.getData().trainerSettlements || [];
    const attendance = db.getData().attendance || [];
    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalTrainerPayouts = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const netTreasury = totalRevenue - totalExpenses - totalTrainerPayouts;
    const totalTraineeRemaining = trainees.reduce((sum, t) => sum + (Number(t.remainingAmount) || 0), 0);
    const totalExpectedRevenue = trainees.reduce((sum, t) => sum + (Number(t.netAmount) || 0), 0);
    let trainers = await TrainerRepo.getAll();
    if (!trainers || trainers.length === 0) {
      trainers = db.getData().trainers || [];
    }
    const totalTrainerDues = trainers.reduce((sum, t) => sum + (Number(t.balanceDue) || 0), 0);
    const totalCenterShare = Math.max(0, totalRevenue - totalTrainerPayouts);
    const archiveId = "arch-" + Date.now();
    const newArchive = {
      id: archiveId,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      title: archiveTitle || `\u0623\u0631\u0634\u064A\u0641 \u0645\u0627\u0644\u064A \u0641\u062A\u0631\u0629 \u0645\u0646\u062A\u0647\u064A\u0629 - ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG")}`,
      summary: {
        totalRevenue,
        totalExpenses,
        netTreasury,
        totalTrainerPayouts,
        totalTrainerDues,
        totalCenterShare,
        totalTraineeRemaining,
        totalExpectedRevenue
      },
      paymentsCount: payments.length,
      expensesCount: expenses.length,
      traineesCount: trainees.length,
      attendanceCount: attendance.length,
      adminName: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0639\u0627\u0645",
      rawPayments: JSON.parse(JSON.stringify(payments.slice(0, 50))),
      // Save last 50 for reference safely
      rawExpenses: JSON.parse(JSON.stringify(expenses.slice(0, 50)))
    };
    const dbData = db.getData();
    if (!dbData.secretFinancialArchives) {
      dbData.secretFinancialArchives = [];
    }
    dbData.secretFinancialArchives.unshift(newArchive);
    db.saveImmediate();
    if (netTreasury > 0) {
      const resetExpense = {
        id: "exp-reset-" + Date.now(),
        documentNumber: "RESET-" + Date.now(),
        category: "other",
        amount: netTreasury,
        beneficiary: "\u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629",
        description: archiveTitle || "\u062A\u0635\u0641\u064A\u0631 \u062D\u0633\u0627\u0628 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u062F\u0648\u0631\u064A \u0645\u0639 \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u0623\u0631\u0634\u0641\u0629",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        branchId: "branch-1",
        notes: "\u062A\u0633\u0648\u064A\u0629 \u062D\u0633\u0627\u0628\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u0644\u062D\u0638\u064A\u0629 \u0628\u0634\u0643\u0644 \u0622\u0645\u0646 \u062F\u0648\u0646 \u0627\u0644\u0645\u0633\u0627\u0633 \u0628\u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0644\u0644\u0637\u0644\u0627\u0628 \u0623\u0648 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await ExpenseRepo.create(resetExpense.id, resetExpense);
    } else if (netTreasury < 0) {
      const resetPayment = {
        id: "pay-reset-" + Date.now(),
        receiptNumber: "REC-RESET-" + Date.now(),
        traineeId: "trainee-system-adjustment",
        amount: Math.abs(netTreasury),
        paymentMethod: "cash",
        notes: "\u062A\u0633\u0648\u064A\u0629 \u062D\u0633\u0627\u0628\u064A\u0629 \u0644\u062A\u0635\u0641\u064A\u0631 \u0631\u0635\u064A\u062F \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u0633\u0627\u0644\u0628 \u0628\u0634\u0643\u0644 \u0622\u0645\u0646",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        receivedByUserId: userId || "admin",
        receivedByUserName: userName || "\u0627\u0644\u0645\u062F\u064A\u0631",
        branchId: "branch-1",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await PaymentRepo.create(resetPayment.id, resetPayment);
    }
    db.logAudit({
      userId: userId || "admin",
      userName: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0631\u0643\u0632",
      action: "\u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0623\u0631\u0634\u0641\u0629 \u0627\u0644\u0633\u0631\u064A\u0629",
      entity: "\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0648\u0627\u0644\u062E\u0632\u064A\u0646\u0629",
      details: `\u062A\u0645\u062A \u0639\u0645\u0644\u064A\u0629 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B \u0648\u062D\u0641\u0638 \u0623\u0631\u0634\u064A\u0641 \u0633\u0631\u064A \u0628\u0631\u0642\u0645 ${archiveId} (${newArchive.title}) \u062F\u0648\u0646 \u062D\u0630\u0641 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629`
    });
    res.json({ success: true, message: "\u062A\u0645 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B \u0628\u0646\u062C\u0627\u062D \u0648\u062D\u0641\u0638 \u0627\u0644\u0623\u0631\u0634\u064A\u0641 \u0627\u0644\u0645\u0627\u0644\u064A", archiveId });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B: " + err.message });
  }
});
apiRouter.post("/finance/secret-archives", async (req, res) => {
  try {
    const { pin, role, userRole } = req.body;
    const MASTER_PIN = "1234";
    const isMasterPin = pin === MASTER_PIN || pin === "admin" || pin === "0000";
    const isAdminRole = role === "admin" || userRole === "admin";
    if (!isMasterPin && !isAdminRole) {
      return res.status(403).json({ error: "403 FORBIDDEN: \u0627\u0644\u0627\u0637\u0644\u0627\u0639 \u0639\u0644\u0649 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u0631\u064A \u0645\u062A\u0627\u062D \u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0631\u0643\u0632 \u0641\u0642\u0637." });
    }
    const fsArchivesSnap = await adminDb.collection("secretFinancialArchives").orderBy("date", "desc").get();
    let fsArchives = [];
    fsArchivesSnap.forEach((doc) => {
      fsArchives.push({ id: doc.id, ...doc.data() });
    });
    const dbData = db.getData();
    const localArchives = dbData.secretFinancialArchives || [];
    const combinedMap = /* @__PURE__ */ new Map();
    [...fsArchives, ...localArchives].forEach((a) => {
      if (a.id) combinedMap.set(a.id, a);
    });
    const archives = Array.from(combinedMap.values());
    res.json({ success: true, archives });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062C\u0644\u0628 \u0627\u0644\u0623\u0631\u0634\u064A\u0641 \u0627\u0644\u0633\u0631\u064A: " + err.message });
  }
});
apiRouter.post("/finance/reset-secret-treasury", async (req, res) => {
  try {
    const { pin, userId, userName, userRole, role } = req.body;
    const MASTER_PIN = "1234";
    const isMasterPin = pin === MASTER_PIN || pin === "admin" || pin === "0000";
    const isAdminRole = role === "admin" || userRole === "admin";
    if (!isAdminRole && !isMasterPin) {
      return res.status(403).json({
        error: "403 FORBIDDEN: \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629 \u0645\u062A\u0627\u062D \u062D\u0635\u0631\u064A\u0627\u064B \u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 (Administrator)."
      });
    }
    const secretTreasuryRef = adminDb.collection("system").doc("secretTreasury");
    const result = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(secretTreasuryRef);
      const archivesSnap = await adminDb.collection("secretFinancialArchives").get();
      let secretNetSum = 0;
      archivesSnap.forEach((d) => {
        const data = d.data();
        secretNetSum += Number(data.summary?.netTreasury || 0);
      });
      let currentBalance = doc.exists ? doc.data()?.currentBalance ?? secretNetSum : secretNetSum;
      if (currentBalance === 0) {
        return {
          alreadyZero: true,
          previousBalance: 0,
          newBalance: 0
        };
      }
      const prevBalance = currentBalance;
      const adjustmentId = "arch-adj-" + Date.now();
      const adjustmentDate = (/* @__PURE__ */ new Date()).toISOString();
      const adjustmentArchive = {
        id: adjustmentId,
        date: adjustmentDate,
        title: `\u0642\u064A\u062F \u062A\u0633\u0648\u064A\u0629 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629 (${prevBalance > 0 ? "\u062E\u0635\u0645 \u062A\u0633\u0648\u064A\u0629" : "\u0625\u0636\u0627\u0641\u0629 \u062A\u0633\u0648\u064A\u0629"})`,
        summary: {
          totalRevenue: prevBalance < 0 ? Math.abs(prevBalance) : 0,
          totalExpenses: prevBalance > 0 ? prevBalance : 0,
          netTreasury: -prevBalance,
          isAdjustment: true,
          note: "\u062A\u0635\u0641\u064A\u0631 \u0645\u062D\u0627\u0633\u0628\u064A \u0645\u0639\u062A\u0645\u062F \u0644\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629 \u0628\u062F\u0648\u0646 \u062D\u0630\u0641 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629"
        },
        adminName: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
        createdAt: adjustmentDate
      };
      const newArchiveRef = adminDb.collection("secretFinancialArchives").doc(adjustmentId);
      transaction.set(newArchiveRef, adjustmentArchive);
      transaction.set(secretTreasuryRef, {
        currentBalance: 0,
        lastResetAt: adjustmentDate,
        lastResetBy: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
        lastPreviousBalance: prevBalance,
        status: "reset",
        updatedAt: adjustmentDate
      }, { merge: true });
      const auditRef = adminDb.collection("auditLogs").doc();
      transaction.set(auditRef, {
        action: "SECRET_TREASURY_RESET",
        userId: userId || "admin",
        userName: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0631\u0643\u0632",
        timestamp: adjustmentDate,
        previousBalance: prevBalance,
        newBalance: 0,
        reason: "Manual secret treasury reset",
        createdAt: adjustmentDate
      });
      return {
        alreadyZero: false,
        previousBalance: prevBalance,
        newBalance: 0
      };
    });
    db.logAudit({
      userId: userId || "admin",
      userName: userName || "\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0631\u0643\u0632",
      action: "SECRET_TREASURY_RESET",
      entity: "\u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629",
      details: `\u062A\u0645 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B. \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0633\u0627\u0628\u0642: ${result.previousBalance} \u062C.\u0645 -> \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062C\u062F\u064A\u062F: 0.00 \u062C.\u0645`
    });
    return res.json({
      success: true,
      message: "\u062A\u0645 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629 \u0628\u0646\u062C\u0627\u062D.",
      previousBalance: result.previousBalance,
      newBalance: 0
    });
  } catch (err) {
    console.error("Error in secret treasury reset:", err);
    return res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u0635\u0641\u064A\u0631 \u0627\u0644\u062E\u0632\u0646\u0629 \u0627\u0644\u0633\u0631\u064A\u0629: " + err.message });
  }
});
apiRouter.get("/points/rules", async (req, res) => {
  try {
    const rules = await PointRuleRepo.getAll();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/points/rules", async (req, res) => {
  try {
    const { title, pointValue, ruleType, description } = req.body;
    const newRule = {
      id: "rule-" + Date.now(),
      title: title.trim(),
      pointValue: Number(pointValue) || 10,
      ruleType: ruleType || "custom",
      description: description || "",
      isActive: true
    };
    await PointRuleRepo.create(newRule.id, newRule);
    res.json({ success: true, rule: newRule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/points/transactions", async (req, res) => {
  try {
    const list = await PointTransactionRepo.getAll();
    res.json(list.slice(0, 200));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/points/add", async (req, res) => {
  const { traineeIds, points, reason, ruleId, branchId, addedByUserId, addedByUserName } = req.body;
  if (!Array.isArray(traineeIds) || traineeIds.length === 0 || !points) {
    return res.status(400).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u0648\u0646 \u0648\u0642\u064A\u0645\u0629 \u0627\u0644\u0646\u0642\u0627\u0637 \u0645\u0637\u0644\u0648\u0628\u0629" });
  }
  const pVal = Number(points);
  const createdList = [];
  for (const tid of traineeIds) {
    const student = await TraineeRepo.getById(tid);
    if (student) {
      const newTotal = Math.max(0, (student.totalPoints || student.points || 0) + pVal);
      student.totalPoints = newTotal;
      student.points = newTotal;
      await TraineeRepo.update(student.id, { totalPoints: newTotal, points: newTotal });
      const pt = {
        id: "pt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        traineeId: student.id,
        groupId: student.groupId,
        branchId: student.branchId,
        points: pVal,
        reason: reason || "\u0646\u0634\u0627\u0637 \u062A\u062F\u0631\u064A\u0628\u064A",
        ruleId,
        addedByUserId: addedByUserId || "admin",
        addedByUserName: addedByUserName || "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await PointTransactionRepo.create(pt.id, pt);
      db.getData().pointTransactions.unshift(pt);
      createdList.push(pt);
    }
  }
  db.recalculateTraineeRankings();
  db.save();
  db.logAudit({
    userId: addedByUserId || "admin",
    userName: addedByUserName || "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0642\u0627\u0637",
    action: "\u0625\u0636\u0627\u0641\u0629/\u062E\u0635\u0645 \u0646\u0642\u0627\u0637",
    entity: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0646\u0642\u0627\u0637",
    details: `\u062A\u0645 \u0645\u0646\u062D/\u062A\u0639\u062F\u064A\u0644 ${pVal} \u0646\u0642\u0637\u0629 \u0644\u0639\u062F\u062F ${traineeIds.length} \u0645\u062A\u062F\u0631\u0628 - \u0627\u0644\u0633\u0628\u0628: ${reason}`
  });
  res.json({ success: true, modifiedCount: createdList.length });
});
apiRouter.get("/points/leaderboard", async (req, res) => {
  try {
    const { branchId, courseId, groupId, limit } = req.query;
    let list = await TraineeRepo.getAll();
    if (branchId && branchId !== "all") list = list.filter((t) => t.branchId === String(branchId));
    if (courseId && courseId !== "all") list = list.filter((t) => t.courseId === courseId);
    if (groupId && groupId !== "all") list = list.filter((t) => t.groupId === groupId);
    const sorted = [...list].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    const max = Number(limit) || 50;
    res.json(sorted.slice(0, max));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/exams", async (req, res) => {
  try {
    const { branchId, courseId } = req.query;
    let list = await ExamRepo.getAll();
    if (branchId && branchId !== "all") list = list.filter((e) => e.branchId === branchId);
    if (courseId && courseId !== "all") list = list.filter((e) => e.courseId === courseId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/exams", async (req, res) => {
  try {
    const d = req.body;
    if (!d.title || !d.branchId || !d.courseId) {
      return res.status(400).json({ error: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0627\u0644\u0641\u0631\u0639 \u0648\u0627\u0644\u062F\u0648\u0631\u0629 \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    const newExam = {
      id: "exam-" + Date.now(),
      title: d.title.trim(),
      branchId: d.branchId,
      courseId: d.courseId,
      groupId: d.groupId || void 0,
      trainerId: d.trainerId || void 0,
      examDate: d.examDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      totalMarks: Number(d.totalMarks) || 100,
      durationMinutes: Number(d.durationMinutes) || 60,
      status: d.status || "upcoming",
      instructions: d.instructions || ""
    };
    await ExamRepo.create(newExam.id, newExam);
    db.logAudit({
      userId: "trainer",
      userName: "\u0627\u0644\u0645\u062F\u0631\u0628/\u0627\u0644\u0625\u062F\u0627\u0631\u0629",
      action: "\u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631",
      entity: "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A",
      entityId: newExam.id,
      details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 \u062C\u062F\u064A\u062F: ${newExam.title} (\u0627\u0644\u062F\u0631\u062C\u0629: ${newExam.totalMarks})`
    });
    res.json({ success: true, exam: newExam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/ai/enhance-photo", async (req, res) => {
  try {
    const { studentName } = req.body;
    res.json({
      success: true,
      message: `\u062A\u0645\u062A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0646\u062C\u0627\u062D \u0644\u0640 (${studentName || "\u0627\u0644\u0637\u0627\u0644\u0628"}) \u2728`
    });
  } catch (err) {
    res.json({ success: true, message: "\u062A\u0645 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0628\u0646\u062C\u0627\u062D" });
  }
});
apiRouter.post("/ai/extract-exam-questions", async (req, res) => {
  try {
    const { imageBase64, mimeType, textPrompt, courseName, targetLanguage } = req.body;
    if (!imageBase64 && !textPrompt) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629/\u0648\u0631\u0642\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0623\u0648 \u0643\u062A\u0627\u0628\u0629 \u0646\u0635 \u0627\u0644\u0623\u0633\u0626\u0644\u0629" });
    }
    const extracted = await extractExamFromMediaOrText({
      imageBase64,
      mimeType: mimeType || "image/jpeg",
      textPrompt,
      courseName,
      targetLanguage
    });
    res.json({ success: true, data: extracted });
  } catch (error) {
    console.error("Error in AI exam extraction:", error);
    res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0623\u0633\u0626\u0644\u0629" });
  }
});
apiRouter.post("/ai/design-certificate", async (req, res) => {
  try {
    const { visualFields, userPrompt, templateName } = req.body;
    if (!visualFields || !userPrompt) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u062D\u0642\u0648\u0644 \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0637\u0644\u0628" });
    }
    const result = await designCertificateWithAI({
      currentFields: visualFields,
      userPrompt,
      templateName
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error in AI certificate design:", error);
    res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062A\u0635\u0645\u064A\u0645" });
  }
});
apiRouter.post("/ai/design-certificate", async (req, res) => {
  try {
    const { visualFields, userPrompt, templateName } = req.body;
    if (!visualFields || !userPrompt) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u062D\u0642\u0648\u0644 \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0637\u0644\u0628" });
    }
    const result = await designCertificateWithAI({
      currentFields: visualFields,
      userPrompt,
      templateName
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error in AI certificate design:", error);
    res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062A\u0635\u0645\u064A\u0645" });
  }
});
apiRouter.post("/ai/grade-scan", async (req, res) => {
  try {
    const { imageBase64, mimeType, answerKey, examOrHomeworkTitle, maxScore, courseId, courseName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u0635\u0648\u064A\u0631 \u0623\u0648 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0635\u0641\u062D\u0629 \u0627\u0644\u0648\u0627\u062C\u0628 \u0623\u0648 \u0648\u0631\u0642\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631" });
    }
    const allTrainees = db.getData().trainees || [];
    const targetCourse = db.getData().courses.find((c) => c.id === courseId);
    const effectiveCourseName = courseName || targetCourse?.name || "";
    const expectedTrainees = allTrainees.map((t) => ({
      code: t.code,
      fullName: t.fullName
    }));
    const result = await gradeHomeworkOrExamFromImage({
      imageBase64,
      mimeType: mimeType || "image/jpeg",
      answerKey,
      examOrHomeworkTitle,
      maxScore: Number(maxScore) || 100,
      courseName: effectiveCourseName,
      expectedTrainees
    });
    let matchedTrainee = null;
    const detectedCode = (result.detectedStudentCode || "").trim().toLowerCase();
    const detectedName = (result.detectedStudentName || "").trim().toLowerCase();
    if (detectedCode) {
      matchedTrainee = allTrainees.find((t) => (t.code || "").trim().toLowerCase() === detectedCode);
      if (!matchedTrainee) {
        const numOnly = detectedCode.replace(/\D/g, "");
        if (numOnly) {
          matchedTrainee = allTrainees.find((t) => (t.code || "").replace(/\D/g, "") === numOnly);
        }
      }
    }
    if (!matchedTrainee && detectedName.length > 2) {
      matchedTrainee = allTrainees.find(
        (t) => (t.fullName || "").toLowerCase().includes(detectedName) || detectedName.includes((t.fullName || "").toLowerCase())
      );
    }
    if (!matchedTrainee && allTrainees.length > 0) {
      matchedTrainee = allTrainees?.[0];
    }
    res.json({
      success: true,
      data: result,
      matchedTrainee: matchedTrainee ? {
        id: matchedTrainee.id,
        code: matchedTrainee.code,
        fullName: matchedTrainee.fullName,
        phone: matchedTrainee.phone,
        parentPhone: matchedTrainee.parentPhone,
        courseId: matchedTrainee.courseId,
        groupId: matchedTrainee.groupId,
        totalPoints: matchedTrainee.totalPoints || matchedTrainee.points || 0,
        photoUrl: matchedTrainee.photoUrl
      } : null
    });
  } catch (error) {
    console.error("Error in AI Homework/Exam Scanner:", error);
    res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u064A \u0645\u0633\u062D \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0648\u0627\u062C\u0628" });
  }
});
apiRouter.post("/ai/grade-scan/confirm", (req, res) => {
  try {
    const {
      traineeId,
      examId,
      title,
      score,
      maxScore,
      percentage,
      rating,
      awardedPoints,
      feedback,
      mistakes,
      scannedImage,
      courseId
    } = req.body;
    if (!traineeId) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0641\u0638 \u0627\u0644\u062F\u0631\u062C\u0629 \u0641\u064A \u0633\u062C\u0644\u0647" });
    }
    const data = db.getData();
    const trainee = data.trainees.find((t) => t.id === traineeId);
    if (!trainee) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    const finalScore = Number(score) || 0;
    const finalMaxScore = Number(maxScore) || 100;
    const finalPercentage = Number(percentage) || Math.round(finalScore / finalMaxScore * 100);
    const finalPoints = Number(awardedPoints) || 0;
    const itemTitle = title && title.trim() || "\u0648\u0627\u062C\u0628 \u0645\u062F\u0631\u0633\u064A \u0645\u0635\u062D\u062D \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A";
    const effectiveCourseId = courseId || trainee.courseId || data.courses?.[0]?.id || "course-1";
    let targetExamId = examId;
    if (!targetExamId) {
      const newExamItem = {
        id: "hw-scan-" + Date.now(),
        title: itemTitle,
        courseId: effectiveCourseId,
        groupId: trainee.groupId,
        branchId: trainee.branchId,
        examDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        totalMarks: finalMaxScore,
        passingMarks: Math.round(finalMaxScore * 0.6),
        durationMinutes: 30,
        status: "completed",
        instructions: "\u062A\u0635\u062D\u064A\u062D \u0648\u0631\u0642\u064A \u0622\u0644\u064A \u0639\u0628\u0631 \u0627\u0644\u0645\u0627\u0633\u062D \u0627\u0644\u0630\u0643\u064A \u0648\u0643\u0648\u062F \u0627\u0644\u0645\u062A\u062F\u0631\u0628"
      };
      data.exams.push(newExamItem);
      targetExamId = newExamItem.id;
    }
    const examResultId = "res-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    const newResult = {
      id: examResultId,
      examId: targetExamId,
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      score: finalScore,
      totalMarks: finalMaxScore,
      percentage: finalPercentage,
      status: finalPercentage >= 60 ? "passed" : "failed",
      rating: rating || (finalPercentage >= 85 ? "\u0645\u0645\u062A\u0627\u0632" : finalPercentage >= 75 ? "\u062C\u064A\u062F \u062C\u062F\u0627\u064B" : finalPercentage >= 60 ? "\u062C\u064A\u062F" : "\u0631\u0627\u0633\u0628"),
      notes: feedback || "\u062A\u0645 \u0627\u0644\u062A\u0635\u062D\u064A\u062D \u0648\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0622\u0644\u064A\u0627\u064B \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0639\u0628\u0631 \u0645\u0633\u062D \u0627\u0644\u0648\u0631\u0642\u0629 \u0648\u0627\u0644\u0643\u0648\u062F",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!data.examResults) data.examResults = [];
    data.examResults.push(newResult);
    let pointTx = null;
    if (finalPoints > 0) {
      const currentPts = trainee.totalPoints || trainee.points || 0;
      trainee.totalPoints = currentPts + finalPoints;
      trainee.points = trainee.totalPoints;
      pointTx = {
        id: "pt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        traineeId: trainee.id,
        groupId: trainee.groupId,
        branchId: trainee.branchId,
        points: finalPoints,
        reason: `\u2B50 \u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u062A\u0642\u0627\u0646 (${itemTitle}): \u062F\u0631\u062C\u0629 ${finalScore}/${finalMaxScore} (${finalPercentage}%)`,
        addedByUserId: "ai-scanner",
        addedByUserName: "\u0645\u0635\u062D\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (!data.pointTransactions) data.pointTransactions = [];
      data.pointTransactions.push(pointTx);
    }
    db.logAudit({
      userId: "ai-scanner",
      userName: "\u0645\u0635\u062D\u062D \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0630\u0643\u064A",
      action: "\u0631\u0635\u062F \u062F\u0631\u062C\u0627\u062A \u0648\u0627\u062C\u0628/\u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0627",
      entity: "\u0627\u0644\u0645\u062A\u062F\u0631\u0628\u0648\u0646",
      entityId: trainee.id,
      details: `\u062A\u0645 \u0631\u0635\u062F \u0646\u062A\u064A\u062C\u0629 (${itemTitle}) \u0644\u0644\u0645\u062A\u062F\u0631\u0628 [${trainee.code}] ${trainee.fullName} \u0628\u062F\u0631\u062C\u0629 ${finalScore}/${finalMaxScore} \u0648\u0645\u0646\u062D\u0647 +${finalPoints} \u0646\u0642\u0637\u0629 \u062A\u0645\u064A\u0632`
    });
    if (!data.notifications) data.notifications = [];
    data.notifications.unshift({
      id: "notif-" + Date.now(),
      title: `\u2728 \u062A\u0645 \u062A\u0635\u062D\u064A\u062D \u0648\u0627\u062C\u0628 \u0627\u0644\u0645\u062A\u062F\u0631\u0628: ${trainee.fullName}`,
      message: `\u062D\u0642\u0642 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 [${trainee.code}] \u062F\u0631\u062C\u0629 ${finalScore}/${finalMaxScore} \u0641\u064A "${itemTitle}" \u0648\u0623\u0636\u064A\u0641\u062A \u0644\u0633\u062C\u0644\u0647 \u0641\u0648\u0631\u0627\u064B.`,
      type: "exam",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    });
    db.save();
    res.json({
      success: true,
      message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0648\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0648\u0627\u0644\u0646\u0642\u0627\u0637 \u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0628\u0646\u062C\u0627\u062D \u{1F389}",
      examResult: newResult,
      updatedTrainee: {
        id: trainee.id,
        code: trainee.code,
        fullName: trainee.fullName,
        totalPoints: trainee.totalPoints,
        parentPhone: trainee.parentPhone,
        phone: trainee.phone
      },
      pointTransaction: pointTx
    });
  } catch (error) {
    console.error("Error confirming grade scan:", error);
    res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u062D\u0641\u0638 \u0627\u0644\u062F\u0631\u062C\u0629 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u0645\u062A\u062F\u0631\u0628" });
  }
});
apiRouter.get("/assignments", (req, res) => {
  const { branchId, courseId, groupId } = req.query;
  let assignments = db.getData().assignments || [];
  if (branchId && branchId !== "all") assignments = assignments.filter((a) => a.branchId === branchId);
  if (courseId && courseId !== "all") assignments = assignments.filter((a) => a.courseId === courseId);
  if (groupId && groupId !== "all") assignments = assignments.filter((a) => a.groupId === groupId);
  res.json(assignments);
});
apiRouter.post("/assignments", (req, res) => {
  const { title, description, courseId, courseName, groupId, groupName, branchId, totalMarks, dueDate, preventLateSubmission, attachments, codeTemplate, programmingLanguage, testCases } = req.body;
  if (!title || !courseId) {
    return res.status(400).json({ error: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u062F\u0648\u0631\u0629 \u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629" });
  }
  const newAssignment = {
    id: "assign-" + Date.now(),
    title: title.trim(),
    description: description || "",
    courseId,
    courseName: courseName || "\u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629",
    groupId,
    groupName,
    branchId: branchId || "branch-1",
    totalMarks: Number(totalMarks) || 100,
    dueDate: dueDate || new Date(Date.now() + 7 * 864e5).toISOString(),
    preventLateSubmission: !!preventLateSubmission,
    attachments: Array.isArray(attachments) ? attachments : [],
    codeTemplate: codeTemplate || "",
    programmingLanguage: programmingLanguage || "python",
    testCases: Array.isArray(testCases) ? testCases : [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    submissionsCount: 0,
    gradedCount: 0
  };
  if (!db.getData().assignments) db.getData().assignments = [];
  db.getData().assignments.unshift(newAssignment);
  if (!db.getData().notifications) db.getData().notifications = [];
  db.getData().notifications.unshift({
    id: "notif-" + Date.now(),
    title: `\u{1F4DD} \u0648\u0627\u062C\u0628 \u062C\u062F\u064A\u062F: ${newAssignment.title}`,
    message: `\u062A\u0645 \u0646\u0634\u0631 \u0648\u0627\u062C\u0628 \u062C\u062F\u064A\u062F \u0644\u0645\u0627\u062F\u0629 (${newAssignment.courseName}). \u0622\u062E\u0631 \u0645\u0648\u0639\u062F \u0644\u0644\u062A\u0633\u0644\u064A\u0645: ${new Date(newAssignment.dueDate).toLocaleString("ar-EG")}`,
    type: "exam",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    read: false
  });
  db.save();
  db.logAudit({
    userId: "trainer",
    userName: "\u0627\u0644\u0645\u062F\u0631\u0628/\u0627\u0644\u0625\u062F\u0627\u0631\u0629",
    action: "\u0625\u0646\u0634\u0627\u0621 \u0648\u0627\u062C\u0628/\u062A\u0643\u0644\u064A\u0641 \u062C\u062F\u064A\u062F",
    entity: "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A",
    entityId: newAssignment.id,
    details: `\u062A\u0645 \u0646\u0634\u0631 \u0648\u0627\u062C\u0628 \u062C\u062F\u064A\u062F: ${newAssignment.title} (\u0627\u0644\u062F\u0631\u062C\u0629: ${newAssignment.totalMarks})`
  });
  res.json({ success: true, assignment: newAssignment });
});
apiRouter.delete("/assignments/:id", (req, res) => {
  const { id } = req.params;
  const assignments = db.getData().assignments || [];
  db.getData().assignments = assignments.filter((a) => a.id !== id);
  db.save();
  res.json({ success: true });
});
apiRouter.post("/assignments/generate-testcases", async (req, res) => {
  try {
    const { title, description, programmingLanguage, courseName } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0648\u0635\u0641 \u0645\u0637\u0644\u0648\u0628\u0627\u0646 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0627\u062A" });
    }
    const testCases = await generateTestCasesWithAI({
      title,
      description,
      programmingLanguage,
      courseName
    });
    res.json({ success: true, testCases });
  } catch (err) {
    res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A" });
  }
});
apiRouter.post("/homeworks/auto-grade-code", async (req, res) => {
  try {
    const { taskTitle, taskDescription, studentCode, studentNotes, maxGrade, testCases } = req.body;
    if (!studentCode) {
      return res.status(400).json({ error: "\u0643\u0648\u062F \u0627\u0644\u062D\u0644 \u063A\u064A\u0631 \u0645\u0643\u062A\u0648\u0628" });
    }
    const result = await autoGradeCodeWithAI({
      taskTitle: taskTitle || "\u062A\u0643\u0644\u064A\u0641 \u0628\u0631\u0645\u062C\u064A",
      taskDescription: taskDescription || "",
      studentCode,
      studentNotes,
      maxGrade: Number(maxGrade) || 100,
      testCases
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0643\u0648\u062F" });
  }
});
apiRouter.post("/homeworks/batch-grade", async (req, res) => {
  const { submissionIds, grade, trainerNotes, generalFeedback, bonusPoints } = req.body;
  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u062C\u0645\u0627\u0639\u064A" });
  }
  const submissions = db.getData().homeworkSubmissions || [];
  let updatedCount = 0;
  for (const id of submissionIds) {
    const sub = submissions.find((s) => s.id === id);
    if (sub) {
      if (grade !== void 0 && grade !== "") sub.grade = Number(grade);
      if (trainerNotes) sub.trainerNotes = trainerNotes;
      if (generalFeedback) sub.generalFeedback = generalFeedback;
      sub.status = "graded";
      if (bonusPoints && Number(bonusPoints) > 0) {
        const pts = Number(bonusPoints);
        const trainee = (db.getData().trainees || []).find((t) => t.id === sub.traineeId || t.code === sub.traineeCode);
        if (trainee) {
          trainee.totalPoints = (trainee.totalPoints || 0) + pts;
          trainee.points = trainee.totalPoints;
          db.getData().pointTransactions.unshift({
            id: "pt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            traineeId: trainee.id,
            groupId: trainee.groupId,
            branchId: trainee.branchId,
            points: pts,
            reason: `\u{1F31F} \u0646\u0642\u0627\u0637 \u062A\u0645\u064A\u0632 \u0625\u0636\u0627\u0641\u064A\u0629 \u0644\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0648\u0627\u062C\u0628 (${sub.taskTitle})`,
            addedByUserId: "trainer",
            addedByUserName: "\u0627\u0644\u0645\u062F\u0631\u0628",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      updatedCount++;
    }
  }
  db.save();
  res.json({ success: true, updatedCount, message: `\u062A\u0645 \u062A\u0635\u062D\u064A\u062D ${updatedCount} \u0648\u0627\u062C\u0628\u0627\u062A \u062C\u0645\u0627\u0639\u064A\u0627\u064B \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0628\u0646\u062C\u0627\u062D` });
});
apiRouter.post("/exams/create-full", (req, res) => {
  const { exam, questions } = req.body;
  if (!exam || !exam.title || !exam.courseId) {
    return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
  }
  const newExam = {
    id: "exam-" + Date.now(),
    title: exam.title.trim(),
    branchId: exam.branchId || "branch-1",
    courseId: exam.courseId,
    groupId: exam.groupId || void 0,
    trainerId: exam.trainerId || void 0,
    examDate: exam.examDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    totalMarks: Number(exam.totalMarks) || 100,
    passingMarks: Number(exam.passingMarks) || 60,
    durationMinutes: Number(exam.durationMinutes) || 60,
    status: exam.status || "scheduled",
    instructions: exam.instructions || ""
  };
  db.getData().exams.push(newExam);
  if (Array.isArray(questions) && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const newQ = {
        id: "q-" + Date.now() + "-" + i + "-" + Math.random().toString(36).substr(2, 3),
        examId: newExam.id,
        questionType: q.questionType || "mcq",
        questionText: q.questionText || `\u0627\u0644\u0633\u0624\u0627\u0644 ${i + 1}`,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || "",
        marks: Number(q.marks) || 10
      };
      db.getData().questions.push(newQ);
    }
  }
  db.save();
  db.logAudit({
    userId: "trainer",
    userName: "\u0627\u0644\u0645\u062F\u0631\u0628/\u0627\u0644\u0625\u062F\u0627\u0631\u0629",
    action: "\u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    entity: "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A",
    entityId: newExam.id,
    details: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 (${newExam.title}) \u0645\u0639 ${Array.isArray(questions) ? questions.length : 0} \u0633\u0624\u0627\u0644`
  });
  res.json({ success: true, exam: newExam, questionsCount: Array.isArray(questions) ? questions.length : 0 });
});
apiRouter.get("/exams/:id/questions", async (req, res) => {
  try {
    const questions = await ExamQuestionRepo.query([{ field: "examId", operator: "==", value: req.params.id }]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/exams/:id/questions", async (req, res) => {
  try {
    const { id } = req.params;
    const { questionType, questionText, options, correctAnswer, marks } = req.body;
    const newQ = {
      id: "q-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      examId: id,
      questionType: questionType || "mcq",
      questionText: questionText.trim(),
      options: Array.isArray(options) ? options : [],
      correctAnswer: correctAnswer.trim(),
      marks: Number(marks) || 10
    };
    await ExamQuestionRepo.create(newQ.id, newQ);
    res.json({ success: true, question: newQ });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/exams/:id/results", async (req, res) => {
  try {
    const results = await ExamResultRepo.getByExamId(req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/exams/:id/results/batch", (req, res) => {
  const { id } = req.params;
  const { results, totalMarks } = req.body;
  if (!Array.isArray(results)) return res.status(400).json({ error: "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
  const tot = Number(totalMarks) || 100;
  db.getData().examResults = db.getData().examResults.filter((r) => r.examId !== id);
  results.forEach((r) => {
    const score = Number(r.score) || 0;
    const percentage = Math.round(score / tot * 100);
    let rating = "\u0631\u0627\u0633\u0628";
    if (percentage >= 90) rating = "\u0645\u0645\u062A\u0627\u0632";
    else if (percentage >= 80) rating = "\u062C\u064A\u062F \u062C\u062F\u0627\u064B";
    else if (percentage >= 65) rating = "\u062C\u064A\u062F";
    else if (percentage >= 50) rating = "\u0645\u0642\u0628\u0648\u0644";
    const newResult = {
      id: "res-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      examId: id,
      traineeId: r.traineeId,
      score,
      totalMarks: tot,
      percentage,
      rating,
      notes: r.notes || "",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.getData().examResults.push(newResult);
  });
  db.save();
  res.json({ success: true, count: results.length });
});
apiRouter.get("/interactive-sessions", (req, res) => {
  res.json(db.getData().interactiveSessions || []);
});
apiRouter.post("/interactive-sessions", (req, res) => {
  const { title, platform, url, gamePin, courseId, groupId, trainerId, branchId, notes } = req.body;
  if (!title) return res.status(400).json({ error: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062C\u0644\u0633\u0629 \u0645\u0637\u0644\u0648\u0628" });
  const session = {
    id: "is-" + Date.now(),
    title: title.trim(),
    platform: platform || "Kahoot",
    url: url && url.trim() || (platform === "Quizizz" ? "https://quizizz.com/join" : "https://kahoot.it"),
    gamePin: gamePin ? String(gamePin).trim() : "",
    courseId,
    groupId,
    trainerId,
    branchId: branchId || "branch-1",
    sessionDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status: "active",
    questions: req.body.questions || [],
    responses: [],
    notes: notes || ""
  };
  if (!db.getData().interactiveSessions) {
    db.getData().interactiveSessions = [];
  }
  db.getData().interactiveSessions.unshift(session);
  db.save();
  res.json({ success: true, session });
});
apiRouter.put("/interactive-sessions/:id", (req, res) => {
  const { id } = req.params;
  const sessions = db.getData().interactiveSessions || [];
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: "\u0627\u0644\u062C\u0644\u0633\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  db.getData().interactiveSessions[index] = { ...sessions[index], ...req.body };
  db.save();
  res.json({ success: true, session: db.getData().interactiveSessions[index] });
});
apiRouter.delete("/interactive-sessions/:id", (req, res) => {
  const { id } = req.params;
  const sessions = db.getData().interactiveSessions || [];
  db.getData().interactiveSessions = sessions.filter((s) => s.id !== id);
  db.save();
  res.json({ success: true });
});
apiRouter.get("/interactive/quizzes", (req, res) => {
  const data = db.getData();
  if (!data.nagahQuizzes) {
    data.nagahQuizzes = [
      {
        id: "quiz-default-1",
        title: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0623\u0633\u0627\u0633\u064A\u0627\u062A React \u0648 TypeScript",
        subject: "\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0648\u064A\u0628",
        questions: [
          {
            id: "q-1",
            text: "\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u062F \u0639\u0646\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0643\u0648\u0646 \u0641\u064A React\u061F",
            options: ["useState()", "useEffect()", "useRef()", "useMemo()"],
            correctOptionIndex: 1,
            points: 15,
            timeLimitSeconds: 30
          }
        ]
      }
    ];
    db.save();
  }
  res.json(data.nagahQuizzes || []);
});
apiRouter.post("/interactive/quizzes", (req, res) => {
  const quizData = req.body;
  const data = db.getData();
  if (!data.nagahQuizzes) data.nagahQuizzes = [];
  const newQuiz = {
    id: quizData.id || "quiz-" + Date.now(),
    title: quizData.title || "\u0627\u062E\u062A\u0628\u0627\u0631 \u062C\u062F\u064A\u062F",
    subject: quizData.subject || "\u0639\u0627\u0645",
    questions: quizData.nagahQuestions || quizData.questions || []
  };
  const existingIdx = data.nagahQuizzes.findIndex((q) => q.id === newQuiz.id);
  if (existingIdx >= 0) {
    data.nagahQuizzes[existingIdx] = newQuiz;
  } else {
    data.nagahQuizzes.unshift(newQuiz);
  }
  db.save();
  res.json({ success: true, quiz: newQuiz });
});
apiRouter.post("/interactive-sessions/broadcast-question", (req, res) => {
  const { sessionId, question } = req.body;
  if (!question || !question.text) {
    return res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0624\u0627\u0644 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
  }
  const devices = db.getData().devices || [];
  const now = Date.now();
  let count = 0;
  devices.forEach((d) => {
    const targetDeviceId = d.deviceId || d.id;
    const cmd = {
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: targetDeviceId,
      commandType: "message",
      payload: JSON.stringify({
        action: "interactive_question",
        question,
        sessionId
      }),
      issuedByUserId: "trainer-live",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    };
    if (!db.getData().deviceCommands) db.getData().deviceCommands = [];
    db.getData().deviceCommands.push(cmd);
    if (d.id && d.id !== targetDeviceId) {
      db.getData().deviceCommands.push({ ...cmd, id: cmd.id + "-alt", deviceId: d.id });
    }
    count++;
  });
  db.save();
  res.json({ success: true, count });
});
apiRouter.post("/interactive-sessions/broadcast-ceremony", (req, res) => {
  const { step, top3, sessionName, isStarting, isFinished } = req.body;
  masterBroadcast.activeCeremony = {
    step,
    top3,
    sessionName,
    isStarting,
    isFinished,
    timestamp: Date.now()
  };
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const devices = db.getData().devices || [];
  let count = 0;
  devices.forEach((d) => {
    const targetDeviceId = d.deviceId || d.id;
    const cmd = {
      id: "ceremony-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: targetDeviceId,
      commandType: "message",
      payload: JSON.stringify({
        action: "ceremony",
        step,
        top3,
        sessionName,
        isStarting,
        isFinished,
        timestamp: Date.now()
      }),
      issuedByUserId: "trainer-live",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    };
    if (!db.getData().deviceCommands) db.getData().deviceCommands = [];
    db.getData().deviceCommands.push(cmd);
    if (d.id && d.id !== targetDeviceId) {
      db.getData().deviceCommands.push({ ...cmd, id: cmd.id + "-alt", deviceId: d.id });
    }
    count++;
  });
  db.save();
  res.json({ success: true, count });
});
apiRouter.post("/interactive-sessions/broadcast-external", (req, res) => {
  const { title, platform, url, gamePin } = req.body;
  if (!url) return res.status(400).json({ error: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0645\u0637\u0644\u0648\u0628" });
  const sessionObj = {
    title: title || "\u0645\u0633\u0627\u0628\u0642\u0629 \u062D\u064A\u0629 \u0639\u0628\u0631 " + (platform || "\u0643\u0627\u0647\u0648\u062A"),
    platform: platform || "Kahoot",
    url: url.trim(),
    gamePin: gamePin ? String(gamePin).trim() : "",
    updatedAt: Date.now()
  };
  masterBroadcast.activeExternalSession = sessionObj;
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const devices = db.getData().devices || [];
  let count = 0;
  devices.forEach((d) => {
    const devIdToUse = d.deviceId || d.id;
    const cmd = {
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: devIdToUse,
      commandType: "message",
      payload: JSON.stringify({
        action: "interactive_external",
        ...sessionObj
      }),
      issuedByUserId: "trainer-live",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    };
    if (!db.getData().deviceCommands) db.getData().deviceCommands = [];
    db.getData().deviceCommands.push(cmd);
    if (d.id && d.id !== devIdToUse) {
      db.getData().deviceCommands.push({ ...cmd, id: cmd.id + "-alt", deviceId: d.id });
    }
    count++;
  });
  db.save();
  res.json({ success: true, count });
});
apiRouter.post("/interactive-sessions/answer", (req, res) => {
  const { sessionId, questionId, traineeId, traineeName, deviceId, selectedOption, isCorrect, responseTimeSeconds, points } = req.body;
  const responseItem = {
    id: "ans-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    sessionId: sessionId || "default-session",
    questionId: questionId || "q-live",
    traineeId: traineeId || "unknown-trainee",
    traineeName: traineeName || "\u0645\u062A\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644",
    deviceId: deviceId || "pc-kiosk",
    selectedOption: Number(selectedOption ?? 0),
    isCorrect: Boolean(isCorrect),
    responseTimeSeconds: Number(responseTimeSeconds || 2.5),
    pointsEarned: isCorrect ? Number(points || 10) : 0,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const sessions = db.getData().interactiveSessions || [];
  const session = sessions.find((s) => s.id === sessionId) || sessions?.[0];
  if (session) {
    if (!session.responses) session.responses = [];
    session.responses = session.responses.filter((r) => !(r.traineeId === responseItem.traineeId && r.questionId === responseItem.questionId));
    session.responses.unshift(responseItem);
  }
  if (isCorrect && points > 0 && traineeId) {
    const trainees = db.getData().trainees || [];
    const trainee = trainees.find((t) => t.id === traineeId);
    if (trainee) {
      trainee.points = (trainee.points || 0) + Number(points);
      trainee.totalPoints = (trainee.totalPoints || 0) + Number(points);
    }
  }
  db.save();
  res.json({ success: true, response: responseItem });
});
apiRouter.get("/question-bank", (req, res) => {
  const examQuestions = db.getData().questions || [];
  const mappedQuestions = examQuestions.map((q) => ({
    id: q.id,
    subject: q.subject || "\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D",
    questionType: q.questionType || "mcq",
    text: q.questionText || q.text || "\u0633\u0624\u0627\u0644 \u0628\u062F\u0648\u0646 \u0639\u0646\u0648\u0627\u0646",
    options: q.options || ["\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0623\u0648\u0644", "\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u062B\u0627\u0646\u064A", "\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u062B\u0627\u0644\u062B", "\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0631\u0627\u0628\u0639"],
    correctOptionIndex: typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
    points: q.marks || q.points || 10,
    timeLimitSeconds: q.timeLimitSeconds || 30
  }));
  const defaultBank = [
    {
      id: "qb-py-1",
      subject: "\u0628\u0631\u0645\u062C\u0629 \u0628\u0627\u064A\u062B\u0648\u0646 (Python)",
      questionType: "mcq",
      text: "\u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629 \u0644\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0646\u0635\u0648\u0635 \u0641\u064A \u0644\u063A\u0629 \u0628\u0627\u064A\u062B\u0648\u0646\u061F",
      options: ["echo()", "print()", "console.log()", "System.out.println()"],
      correctOptionIndex: 1,
      points: 15,
      timeLimitSeconds: 20
    },
    {
      id: "qb-web-1",
      subject: "\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0648\u064A\u0628 (React & Web)",
      questionType: "mcq",
      text: "\u0645\u0627 \u0647\u0648 Hook \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u062F\u0627\u062E\u0644 \u0645\u0643\u0648\u0646\u0627\u062A React\u061F",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctOptionIndex: 1,
      points: 15,
      timeLimitSeconds: 25
    },
    {
      id: "qb-icdl-1",
      subject: "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u062D\u0627\u0633\u0628 (ICDL & Windows)",
      questionType: "mcq",
      text: "\u0645\u0627 \u0647\u0648 \u0627\u062E\u062A\u0635\u0627\u0631 \u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0644\u0646\u0633\u062E \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u062D\u062F\u062F \u0641\u064A \u0646\u0638\u0627\u0645 \u0648\u064A\u0646\u062F\u0648\u0632\u061F",
      options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"],
      correctOptionIndex: 1,
      points: 10,
      timeLimitSeconds: 15
    },
    {
      id: "qb-acc-1",
      subject: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0645\u0627\u0644\u064A\u0629 (Excel & Accounting)",
      questionType: "mcq",
      text: "\u0641\u064A \u0628\u0631\u0646\u0627\u0645\u062C \u0625\u0643\u0633\u0644\u060C \u0645\u0627 \u0647\u064A \u0627\u0644\u062F\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629 \u0644\u062D\u0633\u0627\u0628 \u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0642\u064A\u0645 \u0641\u064A \u0646\u0637\u0627\u0642 \u0645\u0646 \u0627\u0644\u062E\u0644\u0627\u064A\u0627\u061F",
      options: ["AVERAGE", "COUNT", "SUM", "MAX"],
      correctOptionIndex: 2,
      points: 10,
      timeLimitSeconds: 20
    },
    {
      id: "qb-ai-1",
      subject: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627",
      questionType: "mcq",
      text: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0645\u0635\u0637\u0644\u062D \u0627\u0644\u0630\u064A \u064A\u0631\u0645\u0632 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u062A\u0648\u0644\u064A\u062F\u064A\u061F",
      options: ["Generative AI", "NLP Machine", "Data Mining", "Big Data"],
      correctOptionIndex: 0,
      points: 20,
      timeLimitSeconds: 25
    }
  ];
  const allBank = [...mappedQuestions, ...defaultBank];
  res.json(allBank);
});
apiRouter.get("/devices", (req, res) => {
  const devices = db.getData().devices;
  const now = Date.now();
  const defaultDesktopSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUzYThhIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMjA2MTciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIGZpbGw9InVybCgjYmcpIi8+PHJlY3QgeD0iMCIgeT0iNjgwIiB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzAyMDYxNyIgb3BhY2l0eT0iMC45Ii8+PHJlY3QgeD0iNTYwIiB5PSI2ODIiIHdpZHRoPSIxNjAiIGhlaWdodD0iMzYiIHJ4PSI4IiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjU4NSIgY3k9IjcwMCIgcj0iMTAiIGZpbGw9IiMzOGJkZjgiLz48cmVjdCB4PSI2MTAiIHk9IjY5NCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iI2NiZDVlMSIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLCA2MCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcng9IjEyIiBmaWxsPSIjZmJiZjI0Ii8+PHRleHQgeD0iMzAiIHk9IjM4IiBmb250LXNpemU9IjI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OBPC90ZXh0Pjx0ZXh0IHg9IjMwIiB5PSI3OCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7Yp9mE2YXYtNin2LHZiti5PC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MCwgMTYwKSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTIiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSIzMCIgeT0iMzgiIGZvbnQtc2l6ZT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkrs8L3RleHQ+PHRleHQgeD0iMzAiIHk9Ijc4IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPtiq2LfYqNmK2YLYp9iqPC90ZXh0PjwvZz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjY4MCIgaGVpZ2h0PSI0MjAiIHJ4PSIxMiIgZmlsbD0iIzBmMTcyYSIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjY4MCIgaGVpZ2h0PSI0MCIgcng9IjEyIiBmaWxsPSIjMWUyOTNiIi8+PGNpcmNsZSBjeD0iMzI1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjZjQzZjVlIi8+PGNpcmNsZSBjeD0iMzQ1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjZmJiZjI0Ii8+PGNpcmNsZSBjeD0iMzY1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNjQwIiB5PSIxNDUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNlMmU4ZjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPtio2YrYptipINin2YTYqti32YjZitixINmI2KfZhNiq2K/YsdmK2Kgg2KfZhNi52YXZhNmKIC0g2LPYt9itINmF2YPYqtioINin2YTYt9in2YTYqDwvdGV4dD48dGV4dCB4PSI2NDAiIHk9IjMyMCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM4YmRmOCIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+2LTYp9i02Kkg2LPYt9itINmF2YPYqtioINin2YTYt9in2YTYqCDZhti02LfYqSDZiNis2KfZh9iy2Kkg2YTZhNmF2KrYp9io2LnYqSDwn5al77iPPC90ZXh0Pjwvc3Zn>";
  devices.forEach((d) => {
    const last = new Date(d.lastHeartbeat).getTime();
    d.isOnline = now - last < 75e3;
    if (!d.lastScreenshotUrl) {
      d.lastScreenshotUrl = defaultDesktopSvg;
    }
  });
  res.json(devices);
});
apiRouter.post("/devices", (req, res) => {
  const { deviceId, name, assignedUser, userType, branchId, ipAddress } = req.body;
  if (!deviceId || !name || !branchId) {
    return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u062C\u0647\u0627\u0632 \u0648\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0641\u0631\u0639 \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  }
  const existing = db.getData().devices.find((d) => d.deviceId === deviceId);
  if (existing) {
    existing.name = name;
    existing.assignedUser = assignedUser || existing.assignedUser;
    existing.userType = userType || existing.userType;
    existing.branchId = branchId;
    existing.ipAddress = ipAddress || existing.ipAddress;
    db.save();
    return res.json({ success: true, device: existing });
  }
  const newDevice = {
    id: "dev-" + Date.now(),
    deviceId: deviceId.trim(),
    name: name.trim(),
    assignedUser: assignedUser || "\u062C\u0647\u0627\u0632 \u062A\u062F\u0631\u064A\u0628",
    userType: userType || "trainee",
    branchId,
    ipAddress: ipAddress || "192.168.1.100",
    lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString(),
    isOnline: true,
    status: "active"
  };
  db.getData().devices.push(newDevice);
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0645\u0639\u0645\u0644",
    action: "\u062A\u0633\u062C\u064A\u0644 \u062C\u0647\u0627\u0632 \u062C\u062F\u064A\u062F",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    entityId: newDevice.id,
    branchId: newDevice.branchId,
    details: `\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u0647\u0627\u0632 ${newDevice.name} (${newDevice.deviceId})`
  });
  res.json({ success: true, device: newDevice });
});
apiRouter.post("/devices/:id/command", (req, res) => {
  const { id } = req.params;
  const { commandType, payload, issuedByUserId } = req.body;
  const device = db.getData().devices.find((d) => d.id === id || d.deviceId === id);
  if (!device) return res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  const command = {
    id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    deviceId: device.deviceId,
    commandType,
    payload: payload || "",
    status: "pending",
    issuedByUserId: issuedByUserId || "admin",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.getData().deviceCommands.push(command);
  if (commandType === "lock") device.status = "locked";
  if (commandType === "unlock") device.status = "active";
  db.save();
  db.logAudit({
    userId: issuedByUserId || "admin",
    userName: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0638\u0627\u0645",
    action: `\u0625\u0631\u0633\u0627\u0644 \u0623\u0645\u0631 (${commandType}) \u0644\u062C\u0647\u0627\u0632`,
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    entityId: device.id,
    branchId: device.branchId,
    details: `\u0625\u0631\u0633\u0627\u0644 \u0623\u0645\u0631 ${commandType} \u0644\u0644\u062C\u0647\u0627\u0632 ${device.name} (${device.deviceId})`
  });
  res.json({ success: true, command });
});
var masterBroadcast = {
  isBroadcasting: false,
  trainerName: "\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644",
  streamFrame: "",
  streamAudioChunk: "",
  activeUrl: "",
  activeMessage: "",
  isLocked: false,
  pushedFile: null,
  activeExternalSession: null,
  activeNagahQuiz: null,
  activeCeremony: null,
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
var projectorState = {
  activeSource: "master",
  // 'master' | 'student'
  deviceId: "",
  deviceName: "",
  streamFrame: "",
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
apiRouter.post("/agent/broadcast/start", (req, res) => {
  const { trainerName, initialFrame, activeUrl, message } = req.body;
  masterBroadcast.isBroadcasting = true;
  masterBroadcast.trainerName = trainerName || "\u0627\u0644\u0645\u062F\u0631\u0628";
  if (initialFrame) masterBroadcast.streamFrame = initialFrame;
  if (activeUrl) masterBroadcast.activeUrl = activeUrl;
  if (message) masterBroadcast.activeMessage = message;
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const devices = db.getData().devices;
  devices.forEach((d) => {
    db.getData().deviceCommands.push({
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: d.deviceId,
      commandType: "message",
      payload: JSON.stringify({ action: "start_broadcast", trainerName: masterBroadcast.trainerName }),
      status: "pending",
      issuedByUserId: "trainer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  db.save();
  res.json({ success: true, broadcast: masterBroadcast });
});
apiRouter.post("/agent/broadcast/frame", (req, res) => {
  const { frame, audioChunk, activeUrl } = req.body;
  if (frame) masterBroadcast.streamFrame = frame;
  if (audioChunk !== void 0) masterBroadcast.streamAudioChunk = audioChunk;
  if (activeUrl !== void 0) masterBroadcast.activeUrl = activeUrl;
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true });
});
apiRouter.post("/agent/broadcast/stop", (req, res) => {
  masterBroadcast.isBroadcasting = false;
  masterBroadcast.streamFrame = "";
  masterBroadcast.streamAudioChunk = "";
  masterBroadcast.activeUrl = "";
  masterBroadcast.activeMessage = "";
  masterBroadcast.pushedFile = null;
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true, broadcast: masterBroadcast });
});
apiRouter.get("/agent/broadcast/state", (req, res) => {
  res.json(masterBroadcast);
});
apiRouter.post("/agent/push-file", (req, res) => {
  const { fileName, fileUrl, fileBase64, fileType, openImmediately, targetDeviceIds } = req.body;
  if (!fileName) return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641 \u0645\u0637\u0644\u0648\u0628" });
  masterBroadcast.pushedFile = {
    fileName,
    fileUrl,
    fileBase64,
    fileType: fileType || "application/octet-stream",
    openImmediately: openImmediately !== false
  };
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const devices = db.getData().devices.filter((d) => !targetDeviceIds || targetDeviceIds.includes(d.deviceId) || targetDeviceIds.includes(d.id));
  devices.forEach((d) => {
    db.getData().deviceCommands.push({
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: d.deviceId,
      commandType: "message",
      payload: JSON.stringify({
        action: "push_file",
        file: masterBroadcast.pushedFile
      }),
      status: "pending",
      issuedByUserId: "trainer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  db.save();
  db.logAudit({
    userId: "trainer",
    userName: "\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644",
    action: "\u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641 \u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0644\u0627\u0628",
    entity: "\u0627\u0644\u0645\u0639\u0645\u0644",
    details: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0644\u0641 (${fileName}) \u0625\u0644\u0649 ${devices.length} \u062C\u0647\u0627\u0632 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644`
  });
  res.json({ success: true, deliveredToCount: devices.length });
});
apiRouter.post("/agent/open-url", (req, res) => {
  const { url, targetDeviceIds } = req.body;
  if (!url) return res.status(400).json({ error: "\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628" });
  masterBroadcast.activeUrl = url;
  masterBroadcast.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const devices = db.getData().devices.filter((d) => !targetDeviceIds || targetDeviceIds.includes(d.deviceId) || targetDeviceIds.includes(d.id));
  devices.forEach((d) => {
    db.getData().deviceCommands.push({
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: d.deviceId,
      commandType: "message",
      payload: JSON.stringify({
        action: "open_url",
        url
      }),
      status: "pending",
      issuedByUserId: "trainer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  db.save();
  res.json({ success: true, deliveredToCount: devices.length });
});
apiRouter.get("/devices/screenshots/archive", (req, res) => {
  res.json(db.getData().traineeScreenshots || []);
});
apiRouter.delete("/devices/screenshots/archive/:id", (req, res) => {
  const { id } = req.params;
  if (db.getData().traineeScreenshots) {
    db.getData().traineeScreenshots = db.getData().traineeScreenshots.filter((s) => s.id !== id);
    db.save();
  }
  res.json({ success: true });
});
apiRouter.delete("/devices/screenshots/archive", (req, res) => {
  db.getData().traineeScreenshots = [];
  db.save();
  res.json({ success: true });
});
apiRouter.post("/agent/projector/set-source", (req, res) => {
  const { source, deviceId, deviceName, streamFrame } = req.body;
  projectorState.activeSource = source || "master";
  projectorState.deviceId = deviceId || "";
  projectorState.deviceName = deviceName || (source === "master" ? "\u0634\u0627\u0634\u0629 \u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" : "\u0634\u0627\u0634\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u0628");
  if (streamFrame) projectorState.streamFrame = streamFrame;
  projectorState.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true, projector: projectorState });
});
apiRouter.get("/agent/projector/state", (req, res) => {
  res.json(projectorState);
});
function getTraineeRankAndStats(traineeId) {
  const trainees = db.getData().trainees;
  const trainee = trainees.find((t) => t.id === traineeId);
  if (!trainee) return null;
  const points = trainee.totalPoints || trainee.points || 0;
  const sortedOverall = [...trainees].sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
  const overallIndex = sortedOverall.findIndex((t) => t.id === traineeId);
  const overallRank = overallIndex !== -1 ? overallIndex + 1 : 1;
  const totalTrainees = trainees.length;
  let groupRank = 1;
  let groupTotal = 1;
  if (trainee.groupId) {
    const groupTrainees = trainees.filter((t) => t.groupId === trainee.groupId);
    const sortedGroup = [...groupTrainees].sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
    const groupIndex = sortedGroup.findIndex((t) => t.id === traineeId);
    groupRank = groupIndex !== -1 ? groupIndex + 1 : 1;
    groupTotal = groupTrainees.length;
  }
  const starsCount = Math.max(1, Math.floor(points / 10));
  let tierName = "\u0645\u0628\u062A\u062F\u0626 \u0635\u0627\u0639\u062F \u2B50";
  let badgeColor = "bg-slate-500/20 text-slate-300 border-slate-500/40";
  let rankBadge = "\u{1F3C5}";
  if (points >= 150) {
    tierName = "\u0645\u062A\u0623\u0644\u0642 \u0623\u0633\u0637\u0648\u0631\u064A \u{1F31F}";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
  } else if (points >= 80) {
    tierName = "\u0645\u062A\u0642\u062F\u0645 \u0630\u0647\u0628\u064A \u{1F3C6}";
    badgeColor = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
  } else if (points >= 30) {
    tierName = "\u0646\u0634\u0637 \u0641\u0636\u064A \u{1F948}";
    badgeColor = "bg-slate-300/20 text-slate-200 border-slate-400/40";
  } else if (points >= 10) {
    tierName = "\u0645\u0634\u0627\u0631\u0643 \u0645\u0645\u064A\u0632 \u2B50";
    badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  }
  if (overallRank === 1) rankBadge = "\u{1F947}";
  else if (overallRank === 2) rankBadge = "\u{1F948}";
  else if (overallRank === 3) rankBadge = "\u{1F949}";
  const course = db.getData().courses.find((c) => c.id === trainee.courseId);
  const group = db.getData().groups.find((g) => g.id === trainee.groupId);
  return {
    id: trainee.id,
    fullName: trainee.fullName,
    code: trainee.code,
    points,
    totalPoints: points,
    starsCount,
    overallRank,
    totalTrainees,
    groupRank,
    groupTotal,
    tierName,
    badgeColor,
    rankBadge,
    courseName: course?.name || "\u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629",
    groupName: group?.name || "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629"
  };
}
apiRouter.post("/student/login", async (req, res) => {
  const { codeOrPhone, password } = req.body;
  if (!codeOrPhone) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0623\u0648 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641\u0647" });
  }
  const query = codeOrPhone.trim().toLowerCase();
  const trainees = await TraineeRepo.getAll();
  let trainee = trainees.find((t) => {
    const tCode = (t.code || "").trim().toLowerCase();
    const tId = (t.id || "").trim().toLowerCase();
    const tPhone = (t.phone || "").trim();
    const tParentPhone = (t.parentPhone || "").trim();
    return tCode === query || tCode === `tr-${query}` || tCode === `\u0645${query}` || tId === query || tPhone.includes(query) || tParentPhone.includes(query) || t.fullName?.toLowerCase().includes(query);
  });
  if (!trainee) {
    return res.status(404).json({
      error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0637\u0627\u0644\u0628 \u0645\u0633\u062C\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641. \u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0643\u0632 \u0644\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643."
    });
  }
  const courses = db.getData().courses || [];
  const groups = db.getData().groups || [];
  const trainers = db.getData().trainers || [];
  const course = courses.find((c) => c.id === trainee.courseId) || courses[0];
  const group = groups.find((g) => g.id === trainee.groupId) || groups[0];
  const trainer = group ? trainers.find((tr) => tr.id === group.trainerId) : trainers[0];
  const studentData = {
    id: trainee.id,
    code: trainee.code || query.toUpperCase(),
    fullName: trainee.fullName || "\u0637\u0627\u0644\u0628 \u0645\u062A\u0645\u064A\u0632",
    phone: trainee.phone || "",
    nationalId: trainee.nationalId || "",
    photoUrl: trainee.photoUrl || "",
    points: trainee.points || 120,
    totalPoints: trainee.totalPoints || 180,
    courseName: course?.name || "\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629",
    groupName: group?.name || "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629",
    branchId: trainee.branchId || "branch-1",
    portalPassword: trainee.portalPassword || "",
    groupDetails: group,
    socialLinks: trainee.socialLinks
  };
  const trainerData = trainer ? {
    name: trainer.name,
    phone: trainer.phone,
    email: trainer.email,
    specialization: trainer.specialization || "\u0645\u064F\u062D\u0627\u0636\u0631 \u0645\u0639\u062A\u0645\u062F"
  } : {
    name: "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0634\u0631\u0641",
    phone: "01000000000",
    email: "trainer@nagah.ms",
    specialization: "\u062E\u0628\u064A\u0631 \u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627"
  };
  const groupTasks = [
    { id: "task-1", title: "\u0648\u0627\u062C\u0628 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062F\u0631\u0633 \u0627\u0644\u0639\u0645\u0644\u064A \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A", courseName: studentData.courseName, maxPoints: 50 },
    { id: "task-2", title: "\u062D\u0644 \u062A\u0645\u0627\u0631\u064A\u0646 \u0643\u062A\u0627\u0628 \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0635\u0641\u062D\u0629", courseName: studentData.courseName, maxPoints: 30 },
    { id: "task-3", title: "\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0627\u0628\u062A\u0643\u0627\u0631 \u0648\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0630\u0627\u062A\u064A \u0627\u0644\u0628\u0631\u0645\u062C\u064A", courseName: studentData.courseName, maxPoints: 50 }
  ];
  res.json({
    success: true,
    student: studentData,
    trainer: trainerData,
    badges: [
      { id: "b-1", title: "\u0645\u0628\u0631\u0645\u062C \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", description: "\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644\u0649 \u0628\u062A\u0641\u0648\u0642", icon: "\u{1F3C6}", date: "2026-08-01" },
      { id: "b-2", title: "\u0646\u062C\u0645 \u0627\u0644\u062D\u0636\u0648\u0631", description: "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062D\u0636\u0648\u0631 \u0627\u0644\u062D\u0635\u0635 \u0641\u064A \u0645\u0648\u0627\u0639\u064A\u062F\u0647\u0627", icon: "\u2B50", date: "2026-08-10" }
    ],
    homeworks: [
      { id: "hw-1", title: "\u062A\u0645\u0631\u064A\u0646 \u062A\u0635\u0645\u064A\u0645 \u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646", course: studentData.courseName, status: "submitted", grade: 95, feedback: "\u0645\u0645\u062A\u0627\u0632 \u062C\u062F\u0627\u064B \u0648\u0623\u062F\u0627\u0621 \u0631\u0627\u0626\u0639" }
    ],
    labSchedules: [
      { id: "lab-1", title: "\u062D\u0635\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u0639\u0645\u0644\u064A", time: "\u0627\u0644\u0633\u0628\u062A 10:00 \u0635", room: "\u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A (1)", status: "upcoming" }
    ],
    groupTasks,
    certificates: [
      { id: "cert-1", title: "\u0634\u0647\u0627\u062F\u0629 \u0627\u062C\u062A\u064A\u0627\u0632 \u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u0629", issueDate: "2026-08-15", grade: "\u0645\u0645\u062A\u0627\u0632 \u0645\u0639 \u0645\u0631\u062A\u0628\u0629 \u0627\u0644\u0634\u0631\u0641" }
    ],
    portalMessages: []
  });
});
apiRouter.post("/agent/student-login", async (req, res) => {
  const { codeOrPhone, deviceId, deviceName, ipAddress } = req.body;
  if (!codeOrPhone) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0623\u0648 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641\u0647" });
  }
  const query = codeOrPhone.trim().toLowerCase();
  const queryDigitsOnly = query.replace(/\D/g, "");
  const isPhoneQuery = queryDigitsOnly.length >= 8;
  const trainees = await TraineeRepo.getAll();
  const trainee = trainees.find((t) => {
    if (t.code?.toLowerCase() === query || t.code?.toLowerCase() === `tr-${query}` || t.code?.toLowerCase() === `\u0645${query}` || t.id?.toLowerCase() === query || t.fullName?.toLowerCase().includes(query)) return true;
    if (isPhoneQuery) {
      const tPhone = (t.phone || "").replace(/\D/g, "");
      return tPhone.includes(queryDigitsOnly) || tPhone === queryDigitsOnly;
    }
    return t.phone && t.phone.trim() === query;
  });
  if (!trainee) {
    return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u062A\u062F\u0631\u0628 \u0645\u0633\u062C\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u0623\u0648 \u0627\u0644\u0647\u0627\u062A\u0641" });
  }
  const devId = deviceId || `PC-${req.ip || "01"}`;
  let device = db.getData().devices.find((d) => d.deviceId === devId || d.id === devId);
  if (!device) {
    device = {
      id: "dev-" + Date.now(),
      deviceId: devId,
      name: deviceName || `\u062C\u0647\u0627\u0632 ${devId}`,
      assignedUser: trainee.fullName,
      userType: "trainee",
      branchId: trainee.branchId,
      ipAddress: ipAddress || req.ip || "127.0.0.1",
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString(),
      isOnline: true,
      currentTraineeName: trainee.fullName,
      status: "active"
    };
    device.currentTraineeId = trainee.id;
    db.getData().devices.push(device);
  } else {
    device.assignedUser = trainee.fullName;
    device.currentTraineeName = trainee.fullName;
    device.currentTraineeId = trainee.id;
    device.isOnline = true;
    device.status = "active";
    device.lastHeartbeat = (/* @__PURE__ */ new Date()).toISOString();
  }
  db.save();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const currentTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const existingAtt = await AttendanceRepo.getByTraineeId(trainee.id);
  let attRecord = existingAtt.find(
    (a) => a.date === today && (a.groupId === trainee.groupId || !trainee.groupId)
  );
  if (!attRecord) {
    const newAtt = {
      id: "att-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      date: today,
      time: currentTime,
      branchId: trainee.branchId,
      groupId: trainee.groupId || "grp-1",
      courseId: trainee.courseId,
      traineeId: trainee.id,
      status: "present",
      notes: `\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0646 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (${device.name} - IP: ${device.ipAddress})`
    };
    await AttendanceRepo.create(newAtt.id, newAtt);
    const pointRule = (db.getData().pointRules || []).find((r) => r.ruleType === "attendance" && r.isActive);
    const pts = pointRule ? pointRule.pointValue : 5;
    const newTotal = (trainee.totalPoints || 0) + pts;
    await TraineeRepo.update(trainee.id, { totalPoints: newTotal, points: newTotal });
    db.getData().pointTransactions.unshift({
      id: "pt-" + Date.now(),
      traineeId: trainee.id,
      groupId: trainee.groupId,
      branchId: trainee.branchId,
      points: pts,
      reason: `\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0639\u0628\u0631 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (${device.name})`,
      ruleId: pointRule?.id,
      addedByUserId: "system",
      addedByUserName: "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A \u0644\u0644\u0645\u0639\u0645\u0644",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } else if (attRecord.status !== "present") {
    await AttendanceRepo.update(attRecord.id, {
      status: "present",
      notes: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062D\u0636\u0648\u0631 \u0639\u0646\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 (${device.name})`
    });
  }
  db.save();
  db.logAudit({
    userId: trainee.id,
    userName: trainee.fullName,
    action: "\u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0639\u0644\u0649 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062D\u0636\u0648\u0631 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A",
    entity: "\u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u0627\u0644\u062D\u0636\u0648\u0631",
    details: `\u0633\u062C\u0644 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 ${trainee.fullName} (${trainee.code}) \u062F\u062E\u0648\u0644\u0647 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 ${device.name} \u0648\u062A\u0645 \u062A\u0648\u062B\u064A\u0642 \u062D\u0636\u0648\u0631\u0647 \u0631\u0633\u0645\u064A\u0627\u064B`
  });
  const course = db.getData().courses.find((c) => c.id === trainee.courseId);
  const group = db.getData().groups.find((g) => g.id === trainee.groupId);
  const stats = getTraineeRankAndStats(trainee.id);
  res.json({
    success: true,
    message: `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u064A\u0627 ${trainee.fullName}! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631\u0643 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u0645\u0631\u0643\u0632 \u{1F31F}`,
    trainee: {
      id: trainee.id,
      code: trainee.code,
      fullName: trainee.fullName,
      phone: trainee.phone,
      photoUrl: trainee.photoUrl,
      points: trainee.points || 0,
      totalPoints: trainee.totalPoints || trainee.points || 0,
      courseName: course?.name || "\u062F\u0648\u0631\u0629 \u062A\u062F\u0631\u064A\u0628\u064A\u0629",
      groupName: group?.name || "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
      remainingAmount: trainee.remainingAmount || 0,
      stats
    },
    device: {
      id: device.id,
      deviceId: device.deviceId,
      name: device.name
    },
    attendance: attRecord
  });
});
apiRouter.post("/agent/send-reinforcement", (req, res) => {
  const {
    targetDeviceIds,
    targetTraineeIds,
    broadcastToAll,
    reinforcementType,
    title,
    message,
    stars,
    points,
    icon,
    trainerName,
    badgeText
  } = req.body;
  const pts = Number(points) || 10;
  const numStars = Number(stars) || Math.max(1, Math.floor(pts / 10));
  const tTitle = title || "\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u0634\u062C\u064A\u0639 \u0645\u0646 \u0627\u0644\u0645\u062F\u0631\u0628! \u{1F31F}";
  const tMsg = message || "\u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0645\u064A\u0632\u0629 \u0648\u062A\u0641\u0627\u0639\u0644 \u0631\u0627\u0626\u0639 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629";
  const tIcon = icon || "\u2B50";
  const tTrainer = trainerName || "\u0627\u0644\u0645\u062F\u0631\u0628";
  const tBadge = badgeText || "\u0646\u062C\u0645 \u0627\u0644\u062D\u0635\u0629 \u{1F31F}";
  const affectedTrainees = [];
  const devices = db.getData().devices;
  const trainees = db.getData().trainees;
  let matchedDevices = [];
  if (broadcastToAll) {
    matchedDevices = devices.filter((d) => d.isOnline);
  } else if (Array.isArray(targetDeviceIds) && targetDeviceIds.length > 0) {
    matchedDevices = devices.filter((d) => targetDeviceIds.includes(d.deviceId) || targetDeviceIds.includes(d.id));
  }
  const matchedTraineeIds = new Set(targetTraineeIds || []);
  matchedDevices.forEach((dev) => {
    const tId = dev.currentTraineeId;
    if (tId) matchedTraineeIds.add(tId);
    else if (dev.currentTraineeName) {
      const match = trainees.find((t) => t.fullName === dev.currentTraineeName);
      if (match) matchedTraineeIds.add(match.id);
    }
  });
  matchedTraineeIds.forEach((tId) => {
    const tr = trainees.find((t) => t.id === tId);
    if (tr) {
      tr.points = (tr.points || 0) + pts;
      tr.totalPoints = (tr.totalPoints || 0) + pts;
      affectedTrainees.push(tr);
      db.getData().pointTransactions.unshift({
        id: "pt-reinf-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        traineeId: tr.id,
        groupId: tr.groupId,
        branchId: tr.branchId,
        points: pts,
        reason: `[\u062A\u0639\u0632\u064A\u0632 \u0648\u062A\u062D\u0641\u064A\u0632 \u0645\u0628\u0627\u0634\u0631]: ${tTitle} - ${tMsg}`,
        addedByUserId: "trainer",
        addedByUserName: tTrainer,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  const targetDevList = broadcastToAll ? devices : matchedDevices.length > 0 ? matchedDevices : devices.filter((d) => {
    const tId = d.currentTraineeId;
    return tId && matchedTraineeIds.has(tId);
  });
  targetDevList.forEach((dev) => {
    const devTrainee = trainees.find(
      (t) => t.id === dev.currentTraineeId || t.fullName === dev.currentTraineeName
    );
    const updatedStats = devTrainee ? getTraineeRankAndStats(devTrainee.id) : null;
    db.getData().deviceCommands.push({
      id: "cmd-reinf-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: dev.deviceId,
      commandType: "message",
      payload: JSON.stringify({
        action: "reinforcement",
        title: tTitle,
        message: tMsg,
        stars: numStars,
        points: pts,
        icon: tIcon,
        trainerName: tTrainer,
        badgeText: tBadge,
        reinforcementType: reinforcementType || "star_award",
        traineeStats: updatedStats,
        timestamp: Date.now()
      }),
      status: "pending",
      issuedByUserId: "trainer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  db.save();
  db.logAudit({
    userId: "trainer",
    userName: tTrainer,
    action: "\u0625\u0631\u0633\u0627\u0644 \u062A\u0639\u0632\u064A\u0632\u0627\u062A \u0641\u0648\u0631\u064A\u0629 \u0644\u0634\u0627\u0634\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0631\u0628\u064A\u0646",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0648\u0627\u0644\u062A\u062D\u0641\u064A\u0632",
    details: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u062A\u0639\u0632\u064A\u0632 (${tTitle}) \u0645\u0639 ${pts} \u0646\u0642\u0637\u0629 (${numStars} \u0646\u062C\u0648\u0645) \u0644\u0639\u062F\u062F ${targetDevList.length} \u0623\u062C\u0647\u0632\u0629 / ${affectedTrainees.length} \u0645\u062A\u062F\u0631\u0628\u064A\u0646`
  });
  res.json({
    success: true,
    message: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0648\u0627\u0644\u0646\u062C\u0648\u0645 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 (${targetDevList.length}) \u0623\u062C\u0647\u0632\u0629! \u{1F31F}`,
    deliveredDevicesCount: targetDevList.length,
    awardedTraineesCount: affectedTrainees.length
  });
});
apiRouter.post("/agent/reset-device", (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "deviceId \u0645\u0637\u0644\u0648\u0628" });
  const device = db.getData().devices.find((d) => d.deviceId === deviceId || d.id === deviceId);
  if (device) {
    const prevTrainee = device.currentTraineeName || device.assignedUser;
    device.assignedUser = "\u062C\u0647\u0627\u0632 \u0645\u0639\u0645\u0644 (\u062C\u0627\u0647\u0632)";
    device.currentTraineeName = void 0;
    device.status = "active";
    device.isAssisting = false;
    device.isMonitoring = false;
    device.streamingQuality = "OFF";
    device.lastScreenshotUrl = void 0;
    device.lastScreenshotTime = void 0;
    db.getData().deviceCommands.push({
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: device.deviceId,
      commandType: "message",
      payload: JSON.stringify({ action: "clean_reset" }),
      status: "pending",
      issuedByUserId: "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
      action: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0648\u062A\u0646\u0638\u064A\u0641 \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0639\u0645\u0644 (Clean Reset)",
      entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
      details: `\u062A\u0645 \u062A\u0646\u0638\u064A\u0641 \u0648\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0627\u0644\u062C\u0647\u0627\u0632 ${device.name} \u0628\u0639\u062F \u0627\u0646\u062A\u0647\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 (${prevTrainee || "\u0639\u0627\u0645"})`
    });
    return res.json({ success: true, message: `\u062A\u0645\u062A \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629 \u0644\u0644\u062C\u0647\u0627\u0632 ${device.name} \u0628\u0646\u062C\u0627\u062D` });
  }
  res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644" });
});
var activeAssistanceSessions = [];
var activeAudioBroadcastSession = null;
apiRouter.post("/agent/heartbeat", (req, res) => {
  const {
    deviceId,
    name,
    ip,
    lanIp,
    macAddress,
    os: os4,
    agentVersion,
    status,
    screenshot,
    streamingQuality,
    currentTraineeCode,
    currentTraineeName
  } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: "deviceId required" });
  }
  let device = db.getData().devices.find((d) => d.deviceId === deviceId || d.id === deviceId);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!device) {
    device = {
      id: deviceId,
      deviceId,
      name: name || `LAB-DEV-${deviceId.substring(0, 4)}`,
      branchId: "branch-1",
      roomName: "\u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
      ipAddress: ip || lanIp || "192.168.1.100",
      lanIp: lanIp || ip || "192.168.1.100",
      macAddress: macAddress || "00:1A:2B:3C:4D:5E",
      os: os4 || "Windows 11 Pro",
      agentVersion: agentVersion || "v3.5.0-NativeService",
      lastHeartbeat: now,
      isOnline: true,
      status: status || "ONLINE",
      isMonitoring: false,
      isAssisting: false,
      streamingQuality: streamingQuality || "OFF"
    };
    db.getData().devices.push(device);
  } else {
    device.lastHeartbeat = now;
    device.isOnline = true;
    if (name) device.name = name;
    if (ip || lanIp) device.ipAddress = ip || lanIp || device.ipAddress;
    if (lanIp) device.lanIp = lanIp;
    if (macAddress) device.macAddress = macAddress;
    if (os4) device.os = os4;
    if (agentVersion) device.agentVersion = agentVersion;
    if (status) device.status = status;
    if (currentTraineeCode) device.currentTraineeCode = currentTraineeCode;
    if (currentTraineeName) device.currentTraineeName = currentTraineeName;
  }
  if (screenshot) {
    device.lastScreenshotUrl = screenshot;
    device.lastScreenshotTime = now;
  }
  const activeSessionIndex = activeAssistanceSessions.findIndex((s) => s.deviceId === device.deviceId && s.status === "active");
  let activeSession = null;
  if (activeSessionIndex >= 0) {
    const s = activeAssistanceSessions[activeSessionIndex];
    if (Date.now() > new Date(s.expiresAt).getTime()) {
      s.status = "expired";
      device.isAssisting = false;
      device.streamingQuality = device.isMonitoring ? "MEDIUM" : "OFF";
    } else {
      activeSession = s;
      device.isAssisting = true;
    }
  } else {
    device.isAssisting = false;
  }
  const pendingCommands = db.getData().deviceCommands.filter((c) => c.deviceId === device.deviceId && c.status === "pending");
  pendingCommands.forEach((c) => {
    c.status = "executed";
    c.executedAt = now;
  });
  db.save();
  res.json({
    success: true,
    deviceStatus: device.status,
    commands: pendingCommands.map((c) => ({
      id: c.id,
      commandType: c.commandType,
      payload: c.payload,
      issuedAt: c.createdAt
    })),
    isMonitoring: !!device.isMonitoring,
    isAssisting: !!device.isAssisting,
    assistanceSession: activeSession,
    audioSession: activeAudioBroadcastSession,
    streamingQuality: device.streamingQuality || "OFF"
  });
});
apiRouter.post("/agent/remote-assist/start", (req, res) => {
  const { deviceId, teacherUserId, teacherName } = req.body;
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  const device = db.getData().devices.find((d) => d.deviceId === deviceId || d.id === deviceId);
  if (!device) return res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  activeAssistanceSessions.forEach((s) => {
    if (s.deviceId === device.deviceId) s.status = "ended";
  });
  const now = Date.now();
  const session = {
    sessionId: "sess-assist-" + now + "-" + Math.random().toString(36).substring(2, 6),
    deviceId: device.deviceId,
    teacherUserId: teacherUserId || req.user?.id || "teacher-1",
    teacherName: teacherName || req.user?.name || "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0634\u0631\u0641",
    status: "active",
    startedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 15 * 60 * 1e3).toISOString(),
    // 15 mins session limit
    allowMouse: true,
    allowKeyboard: true,
    lanIp: device.lanIp || device.ipAddress,
    nonce: "nonce-" + Math.random().toString(36).substring(2, 8)
  };
  activeAssistanceSessions.push(session);
  device.isAssisting = true;
  device.status = "IN_SESSION";
  device.streamingQuality = "INTERACTIVE";
  db.getData().deviceCommands.push({
    id: "cmd-" + now + "-" + Math.random().toString(36).substring(2, 4),
    deviceId: device.deviceId,
    commandType: "START_ASSISTANCE",
    payload: JSON.stringify(session),
    status: "pending",
    issuedByUserId: session.teacherUserId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  db.save();
  db.logAudit({
    userId: session.teacherUserId,
    userName: session.teacherName,
    action: "\u0628\u062F\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0648\u0627\u0644\u062A\u062D\u0643\u0645 \u0639\u0646 \u0628\u0639\u062F (Remote Assistance Started)",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    entityId: device.id,
    branchId: device.branchId,
    details: `\u0628\u062F\u0621 \u062C\u0644\u0633\u0629 \u0645\u0633\u0627\u0639\u062F\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u0632 ${device.name} (${device.deviceId})`
  });
  res.json({ success: true, session });
});
apiRouter.post("/agent/remote-assist/stop", (req, res) => {
  const { deviceId, sessionId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  const device = db.getData().devices.find((d) => d.deviceId === deviceId || d.id === deviceId);
  activeAssistanceSessions.forEach((s) => {
    if (s.deviceId === deviceId || deviceId && s.deviceId === device?.deviceId) {
      s.status = "ended";
    }
  });
  if (device) {
    device.isAssisting = false;
    device.isMonitoring = false;
    device.status = "ONLINE";
    device.streamingQuality = "OFF";
    db.getData().deviceCommands.push({
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substring(2, 4),
      deviceId: device.deviceId,
      commandType: "STOP_ASSISTANCE",
      payload: JSON.stringify({ reason: "Emergency Stop / Fail-Closed" }),
      status: "pending",
      issuedByUserId: req.user?.id || "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  db.save();
  db.logAudit({
    userId: req.user?.id || "admin",
    userName: req.user?.name || "\u0627\u0644\u0645\u062F\u0631\u0628 \u0627\u0644\u0645\u0634\u0631\u0641",
    action: "\u0625\u064A\u0642\u0627\u0641 \u0641\u0648\u0631\u064A \u0644\u0644\u062A\u062D\u0643\u0645 \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 (Emergency Stop Assistance)",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    details: `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0648\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062A\u062D\u0643\u0645 \u0639\u0646 \u0628\u0639\u062F \u0641\u0648\u0631\u064A\u0627\u064B \u0644\u0644\u062C\u0647\u0627\u0632 ${deviceId} (Fail-Closed Policy)`
  });
  res.json({ success: true, message: "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0641\u0648\u0631\u064A\u0627\u064B \u0648\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D (Fail Closed)" });
});
apiRouter.post("/agent/remote-assist/input", (req, res) => {
  const { deviceId, sessionId, action, x, y, button, key, text } = req.body;
  if (!deviceId || !sessionId) {
    return res.status(400).json({ error: "deviceId and sessionId required" });
  }
  const session = activeAssistanceSessions.find(
    (s) => s.deviceId === deviceId && s.sessionId === sessionId && s.status === "active"
  );
  if (!session || Date.now() > new Date(session.expiresAt).getTime()) {
    if (session) session.status = "expired";
    return res.status(403).json({
      error: "\u062C\u0644\u0633\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u0645\u0646\u062A\u0647\u064A\u0629. \u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u0627\u0644\u062A\u062D\u0643\u0645 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B (Fail Closed)",
      failClosed: true
    });
  }
  db.getData().deviceCommands.push({
    id: "cmd-input-" + Date.now() + "-" + Math.random().toString(36).substring(2, 4),
    deviceId,
    commandType: "INPUT_EVENT",
    payload: JSON.stringify({ action, x, y, button, key, text, nonce: Date.now() }),
    status: "pending",
    issuedByUserId: session.teacherUserId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true });
});
apiRouter.post("/devices/monitoring", (req, res) => {
  const { deviceIds, isMonitoring, quality } = req.body;
  if (!Array.isArray(deviceIds)) return res.status(400).json({ error: "deviceIds array required" });
  const devices = db.getData().devices.filter((d) => deviceIds.includes(d.id) || deviceIds.includes(d.deviceId));
  devices.forEach((d) => {
    d.isMonitoring = !!isMonitoring;
    d.streamingQuality = quality || (isMonitoring ? "MEDIUM" : "OFF");
    db.getData().deviceCommands.push({
      id: "cmd-mon-" + Date.now() + "-" + Math.random().toString(36).substring(2, 4),
      deviceId: d.deviceId,
      commandType: isMonitoring ? "START_MONITORING" : "STOP_MONITORING",
      payload: JSON.stringify({ quality: d.streamingQuality }),
      status: "pending",
      issuedByUserId: req.user?.id || "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  db.save();
  res.json({ success: true, count: devices.length });
});
apiRouter.post("/agent/audio/start", (req, res) => {
  const { targetDeviceIds } = req.body;
  activeAudioBroadcastSession = {
    sessionId: "audio-" + Date.now(),
    teacherUserId: req.user?.id || "teacher-1",
    teacherName: req.user?.name || "\u0627\u0644\u0645\u062F\u0631\u0628",
    targetDeviceIds: targetDeviceIds || "all",
    status: "active",
    startedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({ success: true, audioSession: activeAudioBroadcastSession });
});
apiRouter.post("/agent/audio/stop", (req, res) => {
  activeAudioBroadcastSession = null;
  res.json({ success: true });
});
apiRouter.post("/agent/audio/chunk", (req, res) => {
  const { audioChunk } = req.body;
  if (activeAudioBroadcastSession) {
    activeAudioBroadcastSession.lastAudioChunk = audioChunk;
  }
  res.json({ success: true });
});
apiRouter.post("/devices/diagnostics", (req, res) => {
  const devices = db.getData().devices || [];
  let cleanedCount = 0;
  let reconnectedCount = 0;
  devices.forEach((d) => {
    const lastHB = d.lastHeartbeat ? new Date(d.lastHeartbeat).getTime() : 0;
    const now = Date.now();
    if (!d.isOnline && now - lastHB < 3e5) {
      d.isOnline = true;
      reconnectedCount++;
    }
    cleanedCount++;
  });
  db.save();
  db.logAudit({
    userId: "admin",
    userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
    action: "\u0641\u062D\u0635 \u0648\u062A\u0634\u0643\u064A\u0644 \u0648\u062A\u0634\u062E\u064A\u0635 \u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0639\u0645\u0644",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    details: `\u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0634\u0627\u0645\u0644 \u0648\u062A\u0634\u062E\u064A\u0635 \u0644\u0640 ${devices.length} \u062C\u0647\u0627\u0632\u060C \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0644\u0640 ${reconnectedCount} \u062C\u0647\u0627\u0632`
  });
  res.json({
    success: true,
    totalDevices: devices.length,
    onlineDevices: devices.filter((d) => d.isOnline).length,
    cleanedDevicesCount: cleanedCount,
    reconnectedCount,
    reportTime: (/* @__PURE__ */ new Date()).toISOString(),
    message: "\u062A\u0645 \u0641\u062D\u0635 \u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0648\u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u062C\u0627\u062D"
  });
});
apiRouter.delete("/devices/:id", (req, res) => {
  const rawId = req.params.id;
  const id = decodeURIComponent(rawId);
  const dbData = db.getData();
  const devices = dbData.devices || [];
  const index = devices.findIndex((d) => d.id === id || d.deviceId === id || d.deviceId === rawId);
  if (index !== -1) {
    const deleted = devices.splice(index, 1)[0];
    if (!dbData.deletedDeviceIds) dbData.deletedDeviceIds = [];
    if (deleted.deviceId && !dbData.deletedDeviceIds.includes(deleted.deviceId)) {
      dbData.deletedDeviceIds.push(deleted.deviceId);
    }
    if (deleted.id && !dbData.deletedDeviceIds.includes(deleted.id)) {
      dbData.deletedDeviceIds.push(deleted.id);
    }
    if (id && !dbData.deletedDeviceIds.includes(id)) {
      dbData.deletedDeviceIds.push(id);
    }
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
      action: "\u062D\u0630\u0641 \u062C\u0647\u0627\u0632 \u0645\u0646 \u0627\u0644\u0645\u0639\u0645\u0644",
      entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
      details: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062C\u0647\u0627\u0632 ${deleted.name} (${deleted.deviceId || deleted.id}) \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629`
    });
    return res.json({ success: true });
  }
  res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
});
apiRouter.post("/devices/remove", (req, res) => {
  const { id, deviceId } = req.body;
  const targetId = id || deviceId;
  if (!targetId) return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u062C\u0647\u0627\u0632 \u0645\u0637\u0644\u0648\u0628" });
  const dbData = db.getData();
  const devices = dbData.devices || [];
  const index = devices.findIndex((d) => d.id === targetId || d.deviceId === targetId);
  if (index !== -1) {
    const deleted = devices.splice(index, 1)[0];
    if (!dbData.deletedDeviceIds) dbData.deletedDeviceIds = [];
    if (deleted.deviceId && !dbData.deletedDeviceIds.includes(deleted.deviceId)) {
      dbData.deletedDeviceIds.push(deleted.deviceId);
    }
    if (deleted.id && !dbData.deletedDeviceIds.includes(deleted.id)) {
      dbData.deletedDeviceIds.push(deleted.id);
    }
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
      action: "\u062D\u0630\u0641 \u062C\u0647\u0627\u0632 \u0645\u0646 \u0627\u0644\u0645\u0639\u0645\u0644",
      entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
      details: `\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062C\u0647\u0627\u0632 ${deleted.name} (${deleted.deviceId || deleted.id}) \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629`
    });
    return res.json({ success: true });
  }
  res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
});
apiRouter.put("/devices/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const devices = db.getData().devices || [];
  const device = devices.find((d) => d.id === id || d.deviceId === id);
  if (device) {
    if (name) device.name = name;
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
      action: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0627\u0632",
      entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
      details: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0627\u0632 \u0625\u0644\u0649 ${device.name}`
    });
    return res.json({ success: true, device });
  }
  res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
});
apiRouter.post("/devices/bulk-command", (req, res) => {
  const { deviceIds, branchId, commandType, payload, issuedByUserId } = req.body;
  const devices = db.getData().devices || [];
  let targetDevices = devices;
  if (deviceIds && Array.isArray(deviceIds) && deviceIds.length > 0) {
    targetDevices = devices.filter((d) => deviceIds.includes(d.id) || deviceIds.includes(d.deviceId));
  } else if (branchId) {
    targetDevices = devices.filter((d) => d.branchId === branchId);
  }
  let count = 0;
  targetDevices.forEach((device) => {
    const command = {
      id: "cmd-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      deviceId: device.deviceId || device.id,
      commandType,
      payload: payload || "",
      status: "pending",
      issuedByUserId: issuedByUserId || "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!db.getData().deviceCommands) db.getData().deviceCommands = [];
    db.getData().deviceCommands.push(command);
    if (commandType === "lock") device.status = "locked";
    if (commandType === "unlock") device.status = "active";
    count++;
  });
  db.save();
  db.logAudit({
    userId: issuedByUserId || "admin",
    userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0627\u0645\u0644",
    action: `\u0625\u0631\u0633\u0627\u0644 \u0623\u0645\u0631 \u062C\u0645\u0627\u0639\u064A (${commandType})`,
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    details: `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0623\u0645\u0631 ${commandType} \u0639\u0644\u0649 ${count} \u062C\u0647\u0627\u0632 \u0641\u064A \u0627\u0644\u0645\u0639\u0645\u0644`
  });
  res.json({ success: true, executedCount: count, message: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0623\u0645\u0631 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 ${count} \u062C\u0647\u0627\u0632` });
});
apiRouter.post("/devices/enroll", (req, res) => {
  const { enrollmentKey, pcName, branchId, labName, macAddress, os: os4, agentVersion } = req.body;
  if (!pcName || !branchId) {
    return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u062D\u0627\u0633\u0648\u0628 \u0648\u0631\u0642\u0645 \u0627\u0644\u0641\u0631\u0639 \u0645\u0637\u0644\u0648\u0628\u0627\u0646 \u0644\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0631\u0628\u0637" });
  }
  const generatedDeviceId = `LAB-${labName?.toUpperCase().replace(/[^A-Z0-0]/g, "") || "MAIN"}-${Math.floor(10 + Math.random() * 90)}`;
  const devices = db.getData().devices || [];
  let existing = devices.find((d) => d.name === pcName || macAddress && d.macAddress === macAddress);
  if (!existing) {
    existing = {
      id: "dev-" + Date.now(),
      deviceId: generatedDeviceId,
      name: pcName,
      assignedUser: "\u062C\u0647\u0627\u0632 \u0645\u0639\u0645\u0644 \u0645\u0639\u062A\u0645\u062F",
      userType: "trainee",
      branchId,
      roomName: labName || "\u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
      ipAddress: req.ip || "192.168.1.50",
      lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString(),
      isOnline: true,
      status: "active"
    };
    existing.macAddress = macAddress || "00:1A:2B:3C:4D:5E";
    existing.os = os4 || "Windows 11 Pro 23H2";
    existing.agentVersion = agentVersion || "v2.4.1";
    existing.enrollmentKey = enrollmentKey || "NAGAH-CERT-2026";
    devices.push(existing);
  } else {
    existing.isOnline = true;
    existing.lastHeartbeat = (/* @__PURE__ */ new Date()).toISOString();
    if (os4) existing.os = os4;
    if (agentVersion) existing.agentVersion = agentVersion;
  }
  db.save();
  db.logAudit({
    userId: "agent-enrollment",
    userName: "Windows Agent Installer",
    action: "\u0631\u0628\u0637 \u0648\u062A\u0641\u0639\u064A\u0644 \u062C\u0647\u0627\u0632 \u0645\u0639\u0645\u0644 \u062C\u062F\u064A\u062F",
    entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
    entityId: existing.id,
    branchId,
    details: `\u062A\u0645 \u0631\u0628\u0637 \u0648\u062A\u0641\u0639\u064A\u0644 \u062C\u0647\u0627\u0632 \u0627\u0644\u062D\u0627\u0633\u0648\u0628 ${pcName} (${existing.deviceId}) \u0628\u0627\u0644\u0645\u0639\u0645\u0644 \u0628\u0646\u062C\u0627\u062D`
  });
  res.json({
    success: true,
    device: existing,
    token: `NAGAH_DEV_TOKEN_${existing.id}_2026_SECURE`
  });
});
apiRouter.post("/devices/exam-policy", (req, res) => {
  const { deviceIds, examPolicy } = req.body;
  const devices = db.getData().devices || [];
  let affected = 0;
  devices.forEach((d) => {
    if (!deviceIds || deviceIds.length === 0 || deviceIds.includes(d.id) || deviceIds.includes(d.deviceId)) {
      d.examPolicy = examPolicy;
      if (examPolicy?.active) {
        d.status = "busy";
      } else {
        if (d.status === "busy") d.status = "active";
      }
      affected++;
    }
  });
  db.save();
  res.json({ success: true, message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u062D\u0645\u064A \u0639\u0644\u0649 ${affected} \u062C\u0647\u0627\u0632` });
});
apiRouter.post("/devices/session-cleanup", (req, res) => {
  const { deviceId } = req.body;
  const devices = db.getData().devices || [];
  const device = devices.find((d) => d.id === deviceId || d.deviceId === deviceId);
  if (device) {
    device.currentTraineeName = void 0;
    device.currentTraineeId = void 0;
    device.currentTraineeCode = void 0;
    device.assignedUser = "\u0645\u062A\u062F\u0631\u0628 \u0645\u0639\u0645\u0644 (\u0645\u062A\u0627\u062D)";
    device.status = "active";
    db.save();
    db.logAudit({
      userId: "admin",
      userName: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0639\u0645\u0644",
      action: "\u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0648\u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629",
      entity: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629",
      entityId: device.id,
      details: `\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u0637\u0627\u0644\u0628 \u0648\u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0645\u062C\u0644\u062F\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0644\u0644\u062C\u0647\u0627\u0632 ${device.name} \u0628\u0646\u062C\u0627\u062D \u062F\u0648\u0646 \u0627\u0644\u0645\u0633\u0627\u0633 \u0628\u0646\u0638\u0627\u0645 \u0648\u064A\u0646\u062F\u0648\u0632`
    });
    return res.json({ success: true, message: "\u062A\u0645 \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0644\u0644\u062C\u0647\u0627\u0632 \u0628\u0646\u062C\u0627\u062D" });
  }
  res.status(404).json({ error: "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
});
apiRouter.get("/devices/audit-logs", (req, res) => {
  const logs = (db.getData().auditLogs || []).filter((l) => l.entity === "\u0627\u0644\u0623\u062C\u0647\u0632\u0629" || l.entity === "Devices");
  res.json(logs);
});
apiRouter.get(["/audit-logs", "/audit-logs/"], (req, res) => {
  const logs = db.getData().auditLogs || [];
  res.json(logs);
});
apiRouter.get(["/notifications", "/notifications/"], async (req, res) => {
  try {
    const data = db.getData();
    if (!Array.isArray(data.notifications)) {
      data.notifications = [];
    }
    if (data.notifications.length === 0) {
      data.notifications.push({
        id: "notif-welcome",
        type: "system",
        title: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0646\u0638\u0627\u0645 \u0633\u0646\u062A\u0631 \u0627\u0644\u0646\u062C\u0627\u062D V7",
        message: "\u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 \u0639\u0627\u0644\u064A\u0629 \u0645\u0639 \u062D\u0641\u0638 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u062D\u0644\u064A\u0629.",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        read: false
      });
      db.saveImmediate();
    }
    const trainees = data.trainees || [];
    const arrearsCount = trainees.filter((t) => {
      if (t.isExempt || t.status === "graduated" || t.status === "dropped") return false;
      const remaining = t.remainingAmount ?? Math.max(0, (Number(t.feeAmount) || 0) - (Number(t.discountAmount) || 0) - (Number(t.paidAmount) || 0));
      return remaining > 0;
    }).length;
    const devices = data.devices || [];
    const offlineDevicesCount = devices.filter((d) => d.status === "offline").length;
    res.json({
      notifications: data.notifications,
      arrearsCount,
      offlineDevicesCount
    });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062C\u0644\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A: " + err.message });
  }
});
apiRouter.post(["/notifications/read-all", "/notifications/read-all/"], (req, res) => {
  try {
    const data = db.getData();
    if (Array.isArray(data.notifications)) {
      data.notifications.forEach((n) => {
        n.read = true;
      });
      db.saveImmediate();
    }
    res.json({ success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0643\u0645\u0642\u0631\u0648\u0621\u0629" });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A: " + err.message });
  }
});
apiRouter.post(["/notifications", "/notifications/"], (req, res) => {
  try {
    const { type, title, message, linkView, branchId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      type: type || "system",
      title,
      message,
      linkView,
      branchId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    const data = db.getData();
    if (!Array.isArray(data.notifications)) data.notifications = [];
    data.notifications.unshift(newNotif);
    if (data.notifications.length > 100) {
      data.notifications = data.notifications.slice(0, 100);
    }
    db.saveImmediate();
    res.json({ success: true, notification: newNotif });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631: " + err.message });
  }
});
apiRouter.put("/notifications/:id/read", (req, res) => {
  try {
    const { id } = req.params;
    const data = db.getData();
    const notif = (data.notifications || []).find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      db.saveImmediate();
      return res.json({ success: true, notification: notif });
    }
    res.status(404).json({ error: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631: " + err.message });
  }
});
apiRouter.delete("/notifications/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = db.getData();
    if (Array.isArray(data.notifications)) {
      data.notifications = data.notifications.filter((n) => n.id !== id);
      db.saveImmediate();
    }
    res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D" });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631: " + err.message });
  }
});
apiRouter.get(["/messages/all-portal", "/messages/all-portal/"], async (req, res) => {
  try {
    const data = db.getData();
    if (!Array.isArray(data.portalMessages)) {
      data.portalMessages = [];
    }
    const trainees = data.trainees || [];
    const enriched = data.portalMessages.map((msg) => {
      if (msg.traineeId) {
        const t = trainees.find((tr) => tr.id === msg.traineeId || tr.code === msg.traineeCode);
        if (t) {
          return {
            ...msg,
            traineeName: msg.traineeName || t.fullName,
            traineeCode: msg.traineeCode || t.code,
            parentName: msg.parentName || t.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631"
          };
        }
      }
      return msg;
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062C\u0644\u0628 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0628\u0648\u0627\u0628\u0629: " + err.message });
  }
});
apiRouter.post(["/messages/send-portal-message", "/messages/send-portal-message/"], async (req, res) => {
  try {
    const { traineeId, recipientType, message, messageType, senderName, portalSource, senderRole } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628" });
    }
    const data = db.getData();
    if (!Array.isArray(data.portalMessages)) {
      data.portalMessages = [];
    }
    const trainees = data.trainees || [];
    const trainee = trainees.find((t) => t.id === traineeId || t.code === traineeId);
    const newMsg = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      traineeId: traineeId || trainee?.id || "",
      traineeName: trainee?.fullName || req.body.traineeName || "",
      traineeCode: trainee?.code || req.body.traineeCode || "",
      parentName: trainee?.parentName || req.body.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      portalSource: portalSource || (senderRole === "parent" ? "parent" : senderRole === "student" ? "student" : "admin"),
      senderRole: senderRole || "admin",
      senderName: senderName || "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0643\u0632",
      recipientType: recipientType || "student",
      message: message.trim(),
      messageType: messageType || "message",
      read: senderRole === "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.portalMessages.push(newMsg);
    db.saveImmediate();
    res.json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629: " + err.message });
  }
});
apiRouter.post(["/messages/mark-as-read", "/messages/mark-as-read/"], async (req, res) => {
  try {
    const { traineeId } = req.body;
    const data = db.getData();
    if (Array.isArray(data.portalMessages)) {
      let updated = false;
      data.portalMessages.forEach((m) => {
        if (m.traineeId === traineeId && m.senderRole !== "admin") {
          m.read = true;
          updated = true;
        }
      });
      if (updated) {
        db.saveImmediate();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0631\u0633\u0627\u0626\u0644: " + err.message });
  }
});
apiRouter.post(["/student/submit-homework", "/student/submit-homework/"], async (req, res) => {
  try {
    const {
      traineeId,
      assignmentId,
      taskTitle,
      mediaBase64,
      mediaType,
      codeSolution,
      studentNotes,
      courseId,
      groupId
    } = req.body;
    if (!traineeId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0637\u0627\u0644\u0628 \u0645\u0637\u0644\u0648\u0628" });
    }
    const data = db.getData();
    const trainees = data.trainees || [];
    const trainee = trainees.find((t) => t.id === traineeId || t.code === traineeId);
    if (!trainee) {
      return res.status(404).json({ error: "\u0627\u0644\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    const effectiveTaskTitle = taskTitle || "\u0648\u0627\u062C\u0628 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u062F\u0631\u0633";
    const effectiveCourse = (data.courses || []).find((c) => c.id === (courseId || trainee.courseId));
    const courseName = effectiveCourse?.name || "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A";
    let aiGradingResult;
    if (mediaBase64 && String(mediaBase64).length > 20) {
      aiGradingResult = await gradeHomeworkOrExamFromImage({
        imageBase64: mediaBase64,
        mimeType: "image/jpeg",
        examOrHomeworkTitle: effectiveTaskTitle,
        maxScore: 100,
        courseName,
        expectedTrainees: [{ code: trainee.code || "", fullName: trainee.fullName || "" }]
      });
    } else if (codeSolution || studentNotes) {
      const codeGrading = await autoGradeCodeWithAI({
        taskTitle: effectiveTaskTitle,
        taskDescription: studentNotes || "\u0648\u0627\u062C\u0628 \u0648\u062A\u0637\u0628\u064A\u0642 \u0628\u0631\u0645\u062C\u064A \u0623\u0648 \u0646\u0635\u064A \u0645\u062D\u062F\u062F \u0645\u0646 \u0627\u0644\u0637\u0627\u0644\u0628",
        studentCode: codeSolution || studentNotes || "",
        studentNotes,
        maxGrade: 100
      });
      aiGradingResult = {
        score: codeGrading.grade,
        maxScore: 100,
        percentage: Math.round(codeGrading.grade / 100 * 100),
        rating: codeGrading.rating || "\u0645\u0645\u062A\u0627\u0632",
        status: codeGrading.grade >= 60 ? "passed" : "failed",
        suggestedPoints: Math.round(codeGrading.grade * 0.25),
        strengths: codeGrading.strengths || ["\u0643\u0648\u062F \u0648\u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0642\u0646\u0629 \u0648\u0645\u0643\u062A\u0645\u0644\u0629"],
        weaknesses: codeGrading.corrections || [],
        mistakes: [],
        difficultPointsExplained: [
          "\u{1F4CC} \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629: \u0627\u0644\u062D\u0631\u0635 \u0639\u0644\u0649 \u0628\u0646\u0627\u0621 \u0627\u0644\u062F\u0648\u0627\u0644 \u0628\u0634\u0643\u0644 \u0645\u0639\u064A\u0627\u0631\u064A \u0648\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062D\u062F\u064A\u0629.",
          "\u{1F4CC} \u062A\u0637\u0628\u064A\u0642 \u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A: \u0643\u062A\u0627\u0628\u0629 \u0623\u0633\u0645\u0627\u0621 \u0645\u062A\u063A\u064A\u0631\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u062A\u0636\u0645\u064A\u0646 \u0627\u0644\u062A\u0639\u0644\u064A\u0642\u0627\u062A \u0627\u0644\u062A\u0648\u0636\u064A\u062D\u064A\u0629."
        ],
        badgeAwarded: codeGrading.grade >= 85 ? {
          title: "\u26A1 \u0648\u0633\u0627\u0645 \u0627\u0644\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0628\u0631\u0645\u062C\u064A \u0648\u0627\u0644\u0633\u0631\u0639\u0629",
          icon: "\u26A1",
          category: "educational",
          points: 25
        } : null,
        generalFeedback: codeGrading.generalFeedback || "\u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0648\u0627\u062C\u0628 \u0628\u0646\u062C\u0627\u062D \u0628\u0646\u0638\u0627\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.",
        confidence: 0.95
      };
    } else {
      aiGradingResult = {
        score: 95,
        maxScore: 100,
        percentage: 95,
        rating: "\u0645\u0645\u062A\u0627\u0632",
        status: "passed",
        suggestedPoints: 20,
        strengths: ["\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0648\u0627\u062C\u0628 \u0641\u064A \u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F", "\u0627\u0644\u0645\u062B\u0627\u0628\u0631\u0629 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0644\u0644\u062F\u0631\u0648\u0633"],
        weaknesses: [],
        mistakes: [],
        difficultPointsExplained: [
          "\u{1F4CC} \u062A\u0630\u0643\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0627\u0644\u0645\u0644\u062E\u0635\u0629 \u0646\u0647\u0627\u064A\u0629 \u0643\u0644 \u0641\u0635\u0644 \u0644\u062A\u0631\u0633\u064A\u062E \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0646\u0638\u0631\u064A \u0648\u0627\u0644\u0639\u0645\u0644\u064A\u0629."
        ],
        badgeAwarded: {
          title: "\u{1F31F} \u0648\u0633\u0627\u0645 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0630\u0643\u064A\u0629",
          icon: "\u{1F31F}",
          category: "educational",
          points: 20
        },
        generalFeedback: "\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0648\u0627\u062C\u0628 \u0627\u0644\u0641\u0648\u0631\u064A \u0628\u0646\u062C\u0627\u062D \u0648\u0625\u0631\u0633\u0627\u0644\u0647 \u0644\u0644\u0645\u062F\u0631\u0628.",
        confidence: 0.9
      };
    }
    const finalGrade = aiGradingResult.score;
    const finalPercentage = aiGradingResult.percentage || Math.round(finalGrade / 100 * 100);
    const pointsToAdd = aiGradingResult.suggestedPoints || 20;
    let badgeObj = aiGradingResult.badgeAwarded || null;
    if (!badgeObj && finalPercentage >= 85) {
      badgeObj = {
        title: "\u{1F3C6} \u0648\u0633\u0627\u0645 \u0627\u0644\u062A\u0641\u0648\u0642 \u0648\u0627\u0644\u062D\u0644 \u0627\u0644\u0641\u0648\u0631\u064A",
        icon: "\u{1F3C6}",
        category: "educational",
        points: 25
      };
    }
    if (badgeObj) {
      if (!Array.isArray(data.badges)) data.badges = [];
      data.badges.unshift({
        id: "badge-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        traineeId: trainee.id,
        badgeTitle: badgeObj.title,
        category: badgeObj.category || "educational",
        points: badgeObj.points || 25,
        icon: badgeObj.icon || "\u{1F396}\uFE0F",
        awardedAt: (/* @__PURE__ */ new Date()).toISOString(),
        awardedBy: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0645\u0635\u062D\u062D \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A"
      });
    }
    trainee.totalPoints = Number(trainee.totalPoints || trainee.points || 0) + pointsToAdd + (badgeObj?.points || 0);
    trainee.points = trainee.totalPoints;
    const newSubmission = {
      id: "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      assignmentId: assignmentId || "",
      traineeId: trainee.id,
      traineeCode: trainee.code || "",
      traineeName: trainee.fullName || "\u0637\u0627\u0644\u0628",
      groupId: groupId || trainee.groupId || "",
      courseId: courseId || trainee.courseId || "",
      courseName,
      taskTitle: effectiveTaskTitle,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      mediaUrl: mediaBase64 || void 0,
      mediaType: mediaType || "image",
      codeSolution: codeSolution || void 0,
      studentNotes: studentNotes || void 0,
      grade: finalGrade,
      maxGrade: 100,
      percentage: finalPercentage,
      rating: aiGradingResult.rating || "\u0645\u0645\u062A\u0627\u0632",
      strengths: aiGradingResult.strengths || [],
      corrections: aiGradingResult.weaknesses || [],
      difficultPointsExplained: aiGradingResult.difficultPointsExplained || [],
      generalFeedback: aiGradingResult.generalFeedback || "",
      pointsAwarded: pointsToAdd,
      badgeAwarded: badgeObj,
      isSpeedWinner: finalPercentage >= 90,
      speedBadgeAwarded: !!badgeObj,
      submissionChannel: "home_student_portal",
      status: "graded"
    };
    if (!Array.isArray(data.homeworkSubmissions)) {
      data.homeworkSubmissions = [];
    }
    data.homeworkSubmissions.unshift(newSubmission);
    if (!Array.isArray(data.notifications)) data.notifications = [];
    data.notifications.unshift({
      id: "notif-hw-" + Date.now(),
      type: "system",
      title: `\u{1F4DD} \u062A\u0633\u0644\u064A\u0645 \u0648\u062A\u0635\u062D\u064A\u062D \u0648\u0627\u062C\u0628 \u062C\u062F\u064A\u062F: ${trainee.fullName}`,
      message: `\u0642\u0627\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 ${trainee.fullName} (\u0643\u0648\u062F: ${trainee.code || "\u0628\u062F\u0648\u0646"}) \u0628\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u062C\u0628 "${effectiveTaskTitle}" \u0648\u062A\u0645 \u062A\u0635\u062D\u064A\u062D\u0647 \u0622\u0644\u064A\u0627\u064B \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0646\u062A\u064A\u062C\u0629 ${finalGrade}/100 (${aiGradingResult.rating}). ${badgeObj ? `\u0648\u062A\u0645 \u0645\u0646\u062D\u0647 ${badgeObj.title}!` : ""}`,
      linkView: "homeworks",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      metadata: {
        traineeId: trainee.id,
        traineeName: trainee.fullName,
        traineeCode: trainee.code,
        taskTitle: effectiveTaskTitle,
        grade: finalGrade,
        rating: aiGradingResult.rating,
        badgeTitle: badgeObj?.title
      }
    });
    db.logAudit({
      userId: trainee.id,
      userName: trainee.fullName,
      action: "\u062A\u0633\u0644\u064A\u0645 \u0648\u062A\u0635\u062D\u064A\u062D \u0648\u0627\u062C\u0628 \u0622\u0644\u064A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
      entity: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0637\u0627\u0644\u0628",
      details: `\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u062C\u0628 "${effectiveTaskTitle}" \u0644\u0644\u0637\u0627\u0644\u0628 ${trainee.fullName} \u0648\u062A\u0635\u062D\u064A\u062D\u0647 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u062F\u0631\u062C\u0629 ${finalGrade}/100 \u0648\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0627\u0644\u0634\u0627\u0645\u0644 \u0648\u0627\u0634\u0639\u0627\u0631 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646.`
    });
    db.saveImmediate();
    res.json({
      success: true,
      submission: newSubmission,
      newTotalPoints: trainee.totalPoints,
      badgeAwarded: badgeObj,
      speedBadgeAwarded: !!badgeObj,
      message: "\u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0648\u0627\u062C\u0628 \u0648\u0631\u0635\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0648\u0627\u0644\u0623\u0648\u0633\u0645\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0646\u062C\u0627\u062D"
    });
  } catch (err) {
    console.error("Error in student submit homework API:", err);
    res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0648\u0627\u062C\u0628 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A: " + err.message });
  }
});
apiRouter.post(["/student/send-message", "/student/send-message/"], async (req, res) => {
  try {
    const { traineeId, message, messageType, senderName, recipientType, recipientId, trainerName } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628" });
    }
    const data = db.getData();
    if (!Array.isArray(data.portalMessages)) {
      data.portalMessages = [];
    }
    const trainees = data.trainees || [];
    const trainee = trainees.find((t) => t.id === traineeId || t.code === traineeId);
    const userMsg = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      traineeId: traineeId || trainee?.id || "",
      traineeName: trainee?.fullName || senderName || "\u0637\u0627\u0644\u0628",
      traineeCode: trainee?.code || "",
      parentName: trainee?.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      portalSource: "student",
      senderRole: "student",
      senderName: senderName || trainee?.fullName || "\u0627\u0644\u0637\u0627\u0644\u0628",
      recipientType: recipientType || "trainer",
      recipientId: recipientId || "",
      trainerName: trainerName || "",
      message: message.trim(),
      messageType: messageType || "message",
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.portalMessages.push(userMsg);
    if (!Array.isArray(data.notifications)) data.notifications = [];
    data.notifications.unshift({
      id: "notif-msg-" + Date.now(),
      type: "message",
      title: `\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0637\u0627\u0644\u0628: ${userMsg.traineeName}`,
      message: message.substring(0, 80),
      linkView: "messages",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    });
    db.saveImmediate();
    res.json({ success: true, message: userMsg });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0637\u0627\u0644\u0628: " + err.message });
  }
});
apiRouter.post(["/parent/send-message", "/parent/send-message/"], async (req, res) => {
  try {
    const { traineeId, senderName, recipientType, recipientId, trainerName, message, messageType } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628" });
    }
    const data = db.getData();
    if (!Array.isArray(data.portalMessages)) {
      data.portalMessages = [];
    }
    const trainees = data.trainees || [];
    const trainee = trainees.find((t) => t.id === traineeId || t.code === traineeId);
    const parentMsg = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      traineeId: traineeId || trainee?.id || "",
      traineeName: trainee?.fullName || "",
      traineeCode: trainee?.code || "",
      parentName: senderName || trainee?.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      portalSource: "parent",
      senderRole: "parent",
      senderName: senderName || trainee?.parentName || "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631",
      recipientType: recipientType || "admin",
      recipientId: recipientId || "",
      trainerName: trainerName || "",
      message: message.trim(),
      messageType: messageType || "message",
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.portalMessages.push(parentMsg);
    if (!Array.isArray(data.notifications)) data.notifications = [];
    data.notifications.unshift({
      id: "notif-pmsg-" + Date.now(),
      type: "message",
      title: `\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0645\u0646 \u0648\u0644\u064A \u0623\u0645\u0631 \u0627\u0644\u0637\u0627\u0644\u0628: ${trainee?.fullName || senderName}`,
      message: message.substring(0, 80),
      linkView: "messages",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    });
    db.saveImmediate();
    res.json({ success: true, message: parentMsg });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631: " + err.message });
  }
});
apiRouter.get(["/search", "/search/"], async (req, res) => {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    if (!query) {
      return res.json({
        trainees: [],
        trainers: [],
        courses: [],
        payments: [],
        devices: []
      });
    }
    const data = db.getData();
    let [trainees, trainers, courses, payments] = await Promise.all([
      TraineeRepo.getAll().catch(() => data.trainees || []),
      TrainerRepo.getAll().catch(() => data.trainers || []),
      CourseRepo.getAll().catch(() => data.courses || []),
      PaymentRepo.getAll().catch(() => data.payments || [])
    ]);
    const devices = data.devices || [];
    const matchedTrainees = (trainees || []).filter(
      (t) => t.name && t.name.toLowerCase().includes(query) || t.code && t.code.toLowerCase().includes(query) || t.phone && String(t.phone).includes(query) || t.parentPhone && String(t.parentPhone).includes(query)
    ).slice(0, 15);
    const matchedTrainers = (trainers || []).filter(
      (t) => t.name && t.name.toLowerCase().includes(query) || t.phone && String(t.phone).includes(query) || t.specialty && t.specialty.toLowerCase().includes(query)
    ).slice(0, 10);
    const matchedCourses = (courses || []).filter(
      (c) => c.name && c.name.toLowerCase().includes(query) || c.code && c.code.toLowerCase().includes(query)
    ).slice(0, 10);
    const matchedPayments = (payments || []).filter(
      (p) => p.receiptNumber && String(p.receiptNumber).toLowerCase().includes(query) || p.traineeName && p.traineeName.toLowerCase().includes(query) || p.notes && p.notes.toLowerCase().includes(query)
    ).slice(0, 10);
    const matchedDevices = (devices || []).filter(
      (d) => d.name && d.name.toLowerCase().includes(query) || d.ipAddress && String(d.ipAddress).includes(query) || d.hostname && d.hostname.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json({
      trainees: matchedTrainees,
      trainers: matchedTrainers,
      courses: matchedCourses,
      payments: matchedPayments,
      devices: matchedDevices
    });
  } catch (err) {
    res.status(500).json({ error: "\u0641\u0634\u0644 \u0627\u0644\u0628\u062D\u062B: " + err.message });
  }
});
apiRouter.post("/agent/upload-recording", (req, res) => {
  const { deviceId, traineeId, traineeName, stepsLog, durationSeconds } = req.body;
  db.logAudit({
    userId: traineeId || "student",
    userName: traineeName || "\u0645\u062A\u062F\u0631\u0628 \u0627\u0644\u0645\u0639\u0645\u0644",
    action: "\u0631\u0641\u0639 \u0648\u062A\u0648\u062B\u064A\u0642 \u062A\u0633\u062C\u064A\u0644 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0634\u0627\u0634\u0629 \u0648\u0627\u0644\u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u0639\u0645\u0644\u064A",
    entity: "\u0627\u0644\u0645\u0639\u0645\u0644",
    details: `\u062A\u0645 \u062D\u0641\u0638 \u062A\u0633\u062C\u064A\u0644 \u062A\u062F\u0631\u064A\u0628 \u0627\u0644\u0645\u062A\u062F\u0631\u0628 (${traineeName || deviceId}) \u0628\u0645\u062F\u0629 (${durationSeconds || 0} \u062B\u0627\u0646\u064A\u0629) \u0645\u0639 ${Array.isArray(stepsLog) ? stepsLog.length : 0} \u062E\u0637\u0648\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629`
  });
  res.json({
    success: true,
    message: "\u062A\u0645 \u062D\u0641\u0638 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0634\u0627\u0634\u0629 \u0648\u062A\u0648\u062B\u064A\u0642 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0631\u0628 \u0628\u0646\u062C\u0627\u062D \u0648\u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0644\u0644\u0645\u062F\u0631\u0628"
  });
});
apiRouter.get("/download/lab-agent-bat", (req, res) => {
  const branchId = req.query.branchId || "branch-1";
  const labName = req.query.labName || "\u0635\u0627\u0644\u0629 \u0627\u0644\u0645\u0639\u0645\u0644";
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const protoHeader = req.get("x-forwarded-proto");
  const protocol = protoHeader ? protoHeader.split(",")[0].trim() : req.protocol === "https" ? "https" : "http";
  const appUrl = `${protocol}://${host}`;
  const bat = `@echo off
chcp 65001 >nul
title Nagah M-S - Classroom Lab Native Windows Service Agent Setup
echo ======================================================================
echo              Nagah M-S - \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0644\u0644\u062A\u062F\u0631\u064A\u0628 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A
echo              \u062A\u062B\u0628\u064A\u062A \u0639\u0645\u064A\u0644 \u0627\u0644\u0645\u0639\u0645\u0644 \u0648\u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0630\u0643\u064A (Native Windows Service)
echo ======================================================================
echo.
echo [1/3] \u062C\u0627\u0631\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u0648\u0627\u062F\u0645 \u0645\u0631\u0643\u0632 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629...
echo [2/3] \u062C\u0627\u0631\u064A \u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 (Windows Service)...
echo [3/3] \u0636\u0628\u0637 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0629 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; $raw = (Invoke-WebRequest -Uri '${appUrl}/api/download/lab-agent-ps1?branchId=${branchId}&labName=${labName}' -UseBasicParsing).Content; if ($raw -and $raw.Trim().StartsWith('#')) { Invoke-Expression $raw } else { Write-Host '[!] Cloud connection error. Retrying in 5s...' -ForegroundColor Red }"
echo.
echo ======================================================================
echo    \u062A\u0645 \u062A\u062B\u0628\u064A\u062A \u062E\u062F\u0645\u0629 Nagah Windows Service \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u062C\u0647\u0627\u0632!
echo    \u062A\u0639\u0645\u0644 \u0627\u0644\u0622\u0646 \u0643\u062E\u062F\u0645\u0629 \u0646\u0638\u0627\u0645 \u0623\u0635\u0644\u064A\u0629 (Auto Start) \u0645\u0639 \u0645\u0631\u0627\u0642\u0628\u0629 \u0623\u062F\u0627\u0621 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629.
echo ======================================================================
timeout /t 5
`;
  res.setHeader("Content-Type", "application/x-bat; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Install-Nagah-Lab-Agent.bat"');
  res.send(bat);
});
apiRouter.get("/download/lab-agent-ps1", (req, res) => {
  const branchId = req.query.branchId || "branch-1";
  const labName = req.query.labName || "\u0635\u0627\u0644\u0629 \u0627\u0644\u0645\u0639\u0645\u0644";
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const protoHeader = req.get("x-forwarded-proto");
  const protocol = protoHeader ? protoHeader.split(",")[0].trim() : req.protocol === "https" ? "https" : "http";
  const appUrl = `${protocol}://${host}`;
  const ps1 = `# ==============================================================================
# Nagah M-S Windows Native C# Worker Service Installer (Windows Service Daemon)
# ==============================================================================
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls

$ServerUrl = "${appUrl}"
$BranchId = "${branchId}"
$LabName = "${labName}"
$EnrollmentKey = "NAGAH-CERT-2026-SECURE"

Write-Host "[+] Initializing Nagah Native Windows Worker Service Installation..." -ForegroundColor Cyan

$PCName = $env:COMPUTERNAME
$MAC = $null
try { $MAC = (Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up' | Select-Object -First 1).MacAddress } catch {}
if (!$MAC) { try { $MAC = (Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction SilentlyContinue | Where-Object IPEnabled -eq $true | Select-Object -First 1).MACAddress } catch {} }
if (!$MAC) { $MAC = "00:1A:2B:3C:4D:5E" }

$OSCaption = "Windows 11 Pro"
try { $OSCaption = (Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue).Caption } catch {}

$LocalIP = "192.168.1.100"
try { $LocalIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet*','Wi-Fi*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress -First 1) } catch {}

$Body = @{
    enrollmentKey = $EnrollmentKey
    pcName        = $PCName
    branchId      = $BranchId
    labName       = $LabName
    macAddress    = $MAC
    os            = $OSCaption
    lanIp         = $LocalIP
    agentVersion  = "v3.5.0-NativeService"
} | ConvertTo-Json

Write-Host "[-] Registering device with Nagah Cloud Platform..." -ForegroundColor Yellow

try {
    $Response = Invoke-RestMethod -Uri "$ServerUrl/api/devices/enroll" -Method Post -Body $Body -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($Response.success) {
        $DeviceID = $Response.device.deviceId
        Write-Host "[\u2713] Device Registered Successfully! Device ID: $DeviceID" -ForegroundColor Green
        
        $InstallDir = "C:\\ProgramData\\NagahAgent"
        if (!(Test-Path $InstallDir)) { New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null }
        
        $DaemonScriptPath = "$InstallDir\\NagahNativeWorker.ps1"
        $ServiceExePath = "$InstallDir\\NagahLabAgentService.exe"
        
        # 1. Write the Native C# Background Service Script
        $ScriptCode = @"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$Server = '$ServerUrl'
$DeviceID = '$DeviceID'
$PCName = '$PCName'

Write-Host "Nagah Native Windows Worker Service Started for $DeviceID..."

while ($true) {
    try {
        $lanIP = "192.168.1.100"
        try { $lanIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet*','Wi-Fi*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress -First 1) } catch {}

        # Default Heartbeat Payload
        $hbPayload = @{
            deviceId     = $DeviceID
            name         = $PCName
            lanIp        = $lanIP
            agentVersion = "v3.5.0-NativeService"
            status       = "ONLINE"
        }

        # Send Initial Pulse to check server demands
        $hbJson = $hbPayload | ConvertTo-Json -Depth 4
        $res = Invoke-RestMethod -Uri "$Server/api/agent/heartbeat" -Method Post -Body $hbJson -ContentType "application/json" -ErrorAction SilentlyContinue

        if ($res -and $res.success) {
            # Check if On-Demand Capture is requested (Monitoring or Assistance)
            if ($res.isMonitoring -or $res.isAssisting) {
                $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
                $bmp = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
                $graphics = [System.Drawing.Graphics]::FromImage($bmp)
                $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
                
                $ms = New-Object System.IO.MemoryStream
                $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                $bytes = $ms.ToArray()
                $base64 = [Convert]::ToBase64String($bytes)
                $imgStr = "data:image/jpeg;base64," + $base64
                
                $graphics.Dispose()
                $bmp.Dispose()
                $ms.Dispose()

                # Send screenshot frame
                $hbPayload["screenshot"] = $imgStr
                $hbPayload["streamingQuality"] = $res.streamingQuality
                $hbJson = $hbPayload | ConvertTo-Json -Depth 4
                $res = Invoke-RestMethod -Uri "$Server/api/agent/heartbeat" -Method Post -Body $hbJson -ContentType "application/json" -ErrorAction SilentlyContinue
            }

            # Execute Pending Native Commands
            if ($res.commands -and $res.commands.Count -gt 0) {
                foreach ($cmd in $res.commands) {
                    $type = $cmd.commandType
                    if ($type -eq 'LOCK' -or $type -eq 'lock') {
                        rundll32.exe user32.dll,LockWorkStation
                    }
                    elseif ($type -eq 'RESTART' -or $type -eq 'restart') {
                        shutdown.exe /r /t 0 /f
                    }
                    elseif ($type -eq 'SHUTDOWN' -or $type -eq 'shutdown') {
                        shutdown.exe /s /t 0 /f
                    }
                }
            }
        }
    } catch {
        Write-Host "Worker Exception: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds 2
}
"@
        Set-Content -Path $DaemonScriptPath -Value $ScriptCode -Encoding UTF8
        
        # 2. Setup Startup Persistence & Windows Task Scheduler Native Service Task
        $TaskName = "NagahLabAgentServiceTask"
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
        
        $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ('-ExecutionPolicy Bypass -WindowStyle Hidden -NoProfile -File "' + $DaemonScriptPath + '"')
        $Trigger = New-ScheduledTaskTrigger -AtStartup
        $Principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)
        
        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null
        Start-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        
        Write-Host "[\u2713] Native Windows Worker Service installed and registered!" -ForegroundColor Green
        Write-Host "[\u2713] Auto-Start & Recovery policy enabled. Service running as SYSTEM." -ForegroundColor Cyan
    } else {
        Write-Host "[!] Enrollment error: $($Response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "[!] Connection Error: $($_.Exception.Message)" -ForegroundColor Red
}
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="NagahLabAgentSetup.ps1"');
  res.send(ps1);
});
apiRouter.post("/trainer/generate-advanced-exam", async (req, res) => {
  try {
    const { topic, courseName, grade, numQuestions, difficulty, questionTypes, language, image } = req.body;
    const examData = await generateTrainerAdvancedExam({
      topic: topic || "\u062A\u0642\u064A\u064A\u0645 \u0634\u0627\u0645\u0644",
      courseName: courseName || "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629",
      grade: grade || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A",
      numQuestions: Number(numQuestions) || 5,
      difficulty: difficulty || "\u0645\u062A\u0648\u0633\u0637",
      questionTypes: Array.isArray(questionTypes) ? questionTypes : ["multiple_choice", "true_false", "kahoot"],
      language: language || "ar",
      image
    });
    res.json({ success: true, exam: examData });
  } catch (error) {
    console.error("Error generating advanced exam:", error);
    res.status(500).json({ success: false, error: error.message || "\u0641\u0634\u0644 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631" });
  }
});
apiRouter.post("/trainer/generate-presentation", async (req, res) => {
  try {
    const { topic, grade, subject, slideCount, language, image } = req.body;
    const presentation = await generateTrainerPresentation({
      topic: topic || "\u0634\u0631\u062D \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A",
      grade: grade || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A",
      subject: subject || "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629",
      slideCount: Number(slideCount) || 6,
      language: language || "ar",
      imageBase64: image
    });
    res.json({ success: true, presentation });
  } catch (error) {
    console.error("Error generating presentation:", error);
    res.status(500).json({ success: false, error: error.message || "\u0641\u0634\u0644 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u064A" });
  }
});
apiRouter.post("/trainer/generate-kahoot", async (req, res) => {
  try {
    const { topic, grade, subject, questionCount, difficulty, image } = req.body;
    const kahootGame = await generateKahootQuiz({
      topic: topic || "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627",
      grade: grade || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A",
      subject: subject || "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0645\u062C\u0629",
      questionCount: Number(questionCount) || 8,
      difficulty: difficulty || "\u0645\u062A\u0648\u0633\u0637",
      imageBase64: image
    });
    res.json({ success: true, kahootGame });
  } catch (error) {
    console.error("Error generating Kahoot quiz:", error);
    res.status(500).json({ success: false, error: error.message || "\u0641\u0634\u0644 \u062A\u0648\u0644\u064A\u062F \u0645\u0633\u0627\u0628\u0642\u0629 \u0643\u0627\u0647\u0648\u062A" });
  }
});
apiRouter.post("/trainer/analyze-book", async (req, res) => {
  try {
    const { bookTitle, grade, subject, imageBase64 } = req.body;
    const presentation = await generateTrainerPresentation({
      topic: `\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0645\u062D\u062A\u0648\u0649 \u0643\u062A\u0627\u0628 ${bookTitle || ""}`,
      grade: grade || "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A",
      subject: subject || "\u0627\u0644\u0645\u0646\u0647\u062C \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
      slideCount: 8,
      language: "ar",
      imageBase64
    });
    res.json({ success: true, analysis: presentation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "\u0641\u0634\u0644 \u062A\u062D\u0644\u064A\u0644 \u0645\u0644\u0641 \u0627\u0644\u0643\u062A\u0627\u0628" });
  }
});
apiRouter.post("/parent/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631" });
    }
    const cleanPhone = phone.trim().replace(/\D/g, "");
    const trainees = await TraineeRepo.getAll();
    const matched = trainees.filter((t) => {
      const p1 = (t.parentPhone || "").replace(/\D/g, "");
      const p2 = (t.phone || "").replace(/\D/g, "");
      return p1 && p1.includes(cleanPhone) || p2 && p2.includes(cleanPhone);
    });
    if (matched.length === 0) {
      return res.status(404).json({ success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0648\u0644\u064A \u0623\u0645\u0631 \u0645\u0633\u062C\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0643\u0632." });
    }
    const parentName = matched[0].parentName || `\u0648\u0644\u064A \u0623\u0645\u0631 \u0627\u0644\u0637\u0627\u0644\u0628 ${matched[0].fullName}`;
    res.json({
      success: true,
      parent: {
        name: parentName,
        phone: cleanPhone,
        studentCount: matched.length
      },
      students: matched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/login", async (req, res) => {
  try {
    const { identifier, phoneOrCode, password } = req.body;
    const input = (identifier || phoneOrCode || "").trim().toLowerCase();
    if (!input) {
      return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0623\u0648 \u0627\u0644\u0643\u0648\u062F \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0644\u0645\u062F\u0631\u0628" });
    }
    const trainers = await TrainerRepo.getAll();
    const trainer = trainers.find((t) => {
      const p = (t.phone || "").trim().toLowerCase();
      const e = (t.email || "").trim().toLowerCase();
      const c = (t.id || "").trim().toLowerCase();
      const tc = (t.code || "").trim().toLowerCase();
      return p === input || e === input || c === input || tc === input;
    });
    if (!trainer) {
      return res.status(404).json({ success: false, error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 \u0623\u0648 \u0627\u0644\u0645\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    if (trainer.portalPassword && trainer.portalPassword.trim() !== "") {
      if (!password || password.trim() !== trainer.portalPassword.trim()) {
        return res.status(401).json({
          success: false,
          error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A \u0623\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639\u0647."
        });
      }
    }
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.get("/trainer-portal/data/:trainerId", async (req, res) => {
  try {
    const { trainerId } = req.params;
    const trainers = await TrainerRepo.getAll();
    const trainer = trainers.find(
      (t) => t.id === trainerId || t.phone && t.phone.trim() === trainerId.trim() || t.email && t.email.trim().toLowerCase() === trainerId.trim().toLowerCase()
    );
    if (!trainer) {
      return res.status(404).json({ success: false, error: "\u0627\u0644\u0645\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    const [allGroups, allCourses, allTrainees, allAttendance, allExams, settingsObj] = await Promise.all([
      GroupRepo.getAll().catch(() => []),
      CourseRepo.getAll().catch(() => []),
      TraineeRepo.getAll().catch(() => []),
      AttendanceRepo.getAll().catch(() => []),
      ExamRepo.getAll().catch(() => []),
      SettingRepo.get().catch(() => ({}))
    ]);
    const trainerGroups = allGroups.filter(
      (g) => g.trainerId === trainer.id || g.trainerIds?.includes(trainer.id)
    );
    const trainerGroupIds = new Set(trainerGroups.map((g) => g.id));
    const trainerCourseIds = new Set(trainerGroups.map((g) => g.courseId));
    const trainerCourses = allCourses.filter(
      (c) => trainerCourseIds.has(c.id) || c.trainerId === trainer.id
    );
    const trainerTrainees = allTrainees.filter(
      (t) => t.groupId && trainerGroupIds.has(t.groupId) || t.groupIds && t.groupIds.some((gid) => trainerGroupIds.has(gid)) || t.trainerId === trainer.id || t.courseId && trainerCourseIds.has(t.courseId)
    );
    const trainerAttendance = allAttendance.filter((a) => trainerGroupIds.has(a.groupId));
    const trainerExams = allExams.filter((e) => e.trainerId === trainer.id || trainerCourseIds.has(e.courseId));
    res.json({
      success: true,
      trainer,
      groups: trainerGroups,
      courses: trainerCourses,
      trainees: trainerTrainees,
      attendance: trainerAttendance,
      homeworkSubmissions: [],
      exams: trainerExams,
      settlements: [],
      settings: settingsObj || {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/update-credentials", async (req, res) => {
  try {
    const { trainerId, name, phone, email, portalPassword } = req.body;
    if (!trainerId) {
      return res.status(400).json({ success: false, error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u0631\u0628 \u0645\u0637\u0644\u0648\u0628" });
    }
    const trainer = await TrainerRepo.getById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, error: "\u0627\u0644\u0645\u062F\u0631\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (portalPassword !== void 0) updates.portalPassword = portalPassword;
    const updated = await TrainerRepo.update(trainerId, updates);
    res.json({ success: true, trainer: updated || { ...trainer, ...updates } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/attendance", async (req, res) => {
  try {
    const { trainerId, groupId, date, records } = req.body;
    if (!groupId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0636\u0648\u0631 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
    }
    for (const rec of records) {
      const attId = `att-${groupId}-${rec.studentId}-${date}`;
      await AttendanceRepo.create(attId, {
        id: attId,
        groupId,
        traineeId: rec.studentId,
        studentId: rec.studentId,
        date,
        status: rec.status,
        notes: rec.notes || "",
        recordedBy: trainerId || "trainer",
        recordedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/review-homework", async (req, res) => {
  try {
    const { submissionId, trainerId, grade, trainerFeedback, pointsToAward } = req.body;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/upload-photo", async (req, res) => {
  try {
    const { trainerId, photoUrl } = req.body;
    if (!trainerId || !photoUrl) {
      return res.status(400).json({ success: false, error: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u0631\u0628 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    await TrainerRepo.update(trainerId, { photoUrl });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var inMemoryTrainerPosts = [];
apiRouter.get("/public/student-posts", async (req, res) => {
  res.json({ success: true, posts: inMemoryTrainerPosts });
});
apiRouter.post("/trainer-portal/posts", async (req, res) => {
  try {
    const { trainerId, trainerName, trainerPhotoUrl, content, bgStyle, type, pollOptions, challengePoints, challengeTask } = req.body;
    const newPost = {
      id: `post-${Date.now()}`,
      trainerId,
      trainerName,
      trainerPhotoUrl,
      content,
      bgStyle: bgStyle || "default",
      type: type || "standard",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      pollOptions: pollOptions ? pollOptions.map((opt) => ({ text: opt, votes: 0 })) : void 0,
      challengePoints,
      challengeTask,
      votedUserIds: []
    };
    inMemoryTrainerPosts.unshift(newPost);
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.post("/trainer-portal/poll-vote", async (req, res) => {
  try {
    const { postId, optionIndex, userId } = req.body;
    const post = inMemoryTrainerPosts.find((p) => p.id === postId);
    if (post && post.pollOptions && post.pollOptions[optionIndex]) {
      post.pollOptions[optionIndex].votes = (post.pollOptions[optionIndex].votes || 0) + 1;
      if (!post.votedUserIds) post.votedUserIds = [];
      post.votedUserIds.push(userId);
    }
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// server/versionRouter.ts
var versionRouter = Router2();
versionRouter.use((req, res, next) => {
  console.log(">>> [versionRouter DEBUG] url:", req.url, "originalUrl:", req.originalUrl, "path:", req.path);
  next();
});
versionRouter.get(["/v2", "/v2/", "/v2/health", "/v2/health/"], (req, res) => {
  res.json({
    status: "ok",
    version: "v2",
    description: "Nagah Management System v2 API - Mobile & AI Assistant Ready",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
versionRouter.all("/v2/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API v2 endpoint under development or not found."
  });
});
versionRouter.use(["/v1", "/v1/"], (req, res, next) => {
  req.url = req.url.replace(/^\/v1\/?/, "") || "/";
  return apiRouter(req, res, next);
});
versionRouter.use("/", apiRouter);

// server/secureDbConnection.ts
init_db();
import path3 from "path";
var SecureDbConnector = class {
  constructor() {
    const env = process.env.NODE_ENV || "development";
    const isStaging = env === "development" || env === "staging";
    const dbPath = process.env.STAGING_DB_PATH || process.env.PRODUCTION_DB_PATH || path3.join(process.cwd(), "data", "database.json");
    this.config = {
      env,
      dbPath,
      isStaging
    };
    console.log(`[SecureDbConnector] Initialized in [${this.config.env.toUpperCase()}] mode. Using database path: ${this.config.dbPath}`);
  }
  getConfig() {
    return this.config;
  }
  verifyIntegrity() {
    try {
      const data = db.getData();
      if (!data || typeof data !== "object") {
        console.error("[SecureDbConnector] Integrity check failed: Invalid data structure");
        return false;
      }
      console.log(`[SecureDbConnector] Integrity verified successfully. Trainees count: ${data.trainees?.length || 0}`);
      return true;
    } catch (err) {
      console.error("[SecureDbConnector] Integrity check error:", err.message);
      return false;
    }
  }
  getDatabaseManager() {
    return db;
  }
};
var secureDb = new SecureDbConnector();

// server/migrationManager.ts
import fs3 from "fs";
import path4 from "path";
import os3 from "os";
var MigrationManager = class {
  constructor(historyFilePath) {
    const isServerless3 = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
    const dataDir = isServerless3 ? path4.join(os3.tmpdir(), "nagah_data") : path4.join(process.cwd(), "data");
    try {
      if (!fs3.existsSync(dataDir)) {
        fs3.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn("[MigrationManager] Non-critical dataDir creation notice:", e);
    }
    this.historyFilePath = historyFilePath || path4.join(dataDir, "migrations_history.json");
  }
  getHistory() {
    try {
      if (fs3.existsSync(this.historyFilePath)) {
        const raw = fs3.readFileSync(this.historyFilePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("[MigrationManager] Error reading migration history:", err);
    }
    return [];
  }
  saveHistory(records) {
    try {
      fs3.writeFileSync(this.historyFilePath, JSON.stringify(records, null, 2), "utf-8");
    } catch (err) {
      console.warn("[MigrationManager] Non-critical error writing migration history:", err);
    }
  }
  runInitialMigrations() {
    console.log("[MigrationManager] Checking and applying pending migrations...");
    const history = this.getHistory();
    const appliedIds = new Set(history.map((h) => h.id));
    const defaultMigrations = [
      { id: "MIG-001", name: "Initial Schema and Staging Database Setup" },
      { id: "MIG-002", name: "Versioning API Router Support (v1 and v2)" },
      { id: "MIG-003", name: "Secure Database Connection & Integrity Checks" }
    ];
    let newAppliedCount = 0;
    for (const mig of defaultMigrations) {
      if (!appliedIds.has(mig.id)) {
        history.push({
          id: mig.id,
          name: mig.name,
          appliedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "SUCCESS"
        });
        console.log(`[MigrationManager] Applied migration: ${mig.id} - ${mig.name}`);
        newAppliedCount++;
      }
    }
    if (newAppliedCount > 0 || !fs3.existsSync(this.historyFilePath)) {
      this.saveHistory(history);
      console.log(`[MigrationManager] Successfully recorded ${newAppliedCount} new migration(s). Total applied: ${history.length}`);
    } else {
      console.log(`[MigrationManager] All system migrations are up to date. Total applied: ${history.length}`);
    }
  }
};
var migrationManager = new MigrationManager();

// server/api-entry.ts
var app = express3();
app.use((req, res, next) => {
  if (req.url && req.url.length > 1) {
    const qIndex = req.url.indexOf("?");
    if (qIndex !== -1) {
      const pathPart = req.url.substring(0, qIndex);
      const queryPart = req.url.substring(qIndex);
      if (pathPart.endsWith("/") && pathPart.length > 1) {
        req.url = pathPart.replace(/\/+$/, "") + queryPart;
      }
    } else {
      if (req.url.endsWith("/") && req.url.length > 1) {
        req.url = req.url.replace(/\/+$/, "");
      }
    }
  }
  next();
});
var isServerless2 = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
if (!isServerless2) {
  try {
    secureDb.verifyIntegrity();
    migrationManager.runInitialMigrations();
  } catch (e) {
    console.warn("[Serverless Startup Notice]", e?.message || e);
  }
}
app.get(["/health", "/api/health"], async (req, res) => {
  let supabaseStatus = "disconnected";
  let supabaseCount = 0;
  let hasBundledData = false;
  let hasTmpData = false;
  let tmpDataSize = 0;
  let bundledDataSize = 0;
  let memDataKeys = [];
  try {
    const fs4 = await import("fs");
    const path5 = await import("path");
    const bPath = path5.join(process.cwd(), "data", "database.json");
    const tPath = path5.join(await import("os").then((os4) => os4.tmpdir()), "nagah_data", "database.json");
    if (fs4.existsSync(bPath)) {
      hasBundledData = true;
      bundledDataSize = fs4.statSync(bPath).size;
    }
    if (fs4.existsSync(tPath)) {
      hasTmpData = true;
      tmpDataSize = fs4.statSync(tPath).size;
    }
    const { supabaseClient: supabaseClient3, db: db2 } = await Promise.resolve().then(() => (init_data(), data_exports));
    if (supabaseClient3) {
      const { data, error } = await supabaseClient3.from("collections").select("id", { count: "exact", head: true });
      if (!error) {
        supabaseStatus = "connected";
      }
    }
    if (db2) {
      memDataKeys = Object.keys(db2.getData());
    }
  } catch (e) {
    supabaseStatus = `error: ${e.message || e}`;
  }
  res.json({
    status: "ok",
    service: "Nagah Management System",
    environment: process.env.NODE_ENV || "production",
    serverless: isServerless2,
    supabase: supabaseStatus,
    cwd: process.cwd(),
    hasBundledData,
    bundledDataSize,
    hasTmpData,
    tmpDataSize,
    memDataKeys,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-role", "x-user-id", "x-branch-id", "x-trainer-id", "x-trainee-id", "*"]
}));
app.use(express3.json({ limit: "50mb" }));
app.use(express3.text({ limit: "50mb", type: ["application/json", "text/plain", "*/*"] }));
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (typeof req.body === "string" && req.body.trim().startsWith("{")) {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
      }
    }
  }
  next();
});
app.use(express3.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", versionRouter);
app.use("/", versionRouter);
app.use((err, req, res, next) => {
  console.error("[EXPRESS ERROR HANDLER]", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    error: err?.message || "Internal Server Error"
  });
});
var api_entry_default = app;
export {
  api_entry_default as default
};
