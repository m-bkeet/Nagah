import { Router } from 'express';
import {
  INITIAL_BRANCHES,
  INITIAL_TRACKS,
  INITIAL_FIELDS,
  INITIAL_LEVELS,
  SERVICE_CODE_REGISTRY,
} from '../domain/registries';
import { ContextFilterEngine } from '../domain/contextFilterEngine';
import { generateNextStudentCode } from '../domain/studentCodeEngine';
import { buildTransactionCode, getNextSequenceNumber } from '../domain/transactionEngine';
import { validateExchangePackage, NagahDataExchangePackage } from '../domain/dataExchangePackage';

export const domainRouter = Router();

// Registries Endpoint
domainRouter.get('/registries', (req, res) => {
  res.json({
    success: true,
    data: {
      branches: INITIAL_BRANCHES,
      tracks: INITIAL_TRACKS,
      fields: INITIAL_FIELDS,
      levels: INITIAL_LEVELS,
      serviceCodes: SERVICE_CODE_REGISTRY,
    },
  });
});

// Context Filter Cascade Endpoint
domainRouter.post('/context-filter', (req, res) => {
  const { selection = {}, allCourses = [], allGroups = [], allTrainers = [], allStudents = [] } = req.body;
  const compatibleTracks = ContextFilterEngine.getCompatibleTracks(selection, INITIAL_TRACKS);
  const compatibleFields = ContextFilterEngine.getCompatibleFields(selection, INITIAL_FIELDS);
  const compatibleLevels = ContextFilterEngine.getCompatibleLevels(selection, INITIAL_LEVELS);
  const compatibleCourses = ContextFilterEngine.getCompatibleCourses(selection, allCourses);
  const compatibleGroups = ContextFilterEngine.getCompatibleGroups(selection, allGroups);
  const compatibleTrainers = ContextFilterEngine.getCompatibleTrainers(selection, allTrainers);
  const compatibleStudents = ContextFilterEngine.getCompatibleStudents(selection, allStudents);

  res.json({
    success: true,
    data: {
      tracks: compatibleTracks,
      fields: compatibleFields,
      levels: compatibleLevels,
      courses: compatibleCourses,
      groups: compatibleGroups,
      trainers: compatibleTrainers,
      students: compatibleStudents,
    },
  });
});

// Transaction Code Endpoint
domainRouter.post('/transactions/build-code', (req, res) => {
  const { context, customSequence } = req.body;
  if (!context || !context.studentCode || !context.serviceType) {
    return res.status(400).json({ success: false, error: 'Context requires studentCode and serviceType' });
  }

  const seq = customSequence || getNextSequenceNumber(context.serviceType, context.studentCode);
  const transactionCode = buildTransactionCode(context, seq);

  res.json({
    success: true,
    data: {
      transactionCode,
      sequenceNumber: seq,
      serviceCode: context.serviceType,
    },
  });
});

// Student Code Engine Endpoint
domainRouter.get('/students/next-code', (req, res) => {
  const { cohortLetter = 'A', existingCodes = '' } = req.query;
  const codesArray = typeof existingCodes === 'string' ? existingCodes.split(',').filter(Boolean) : [];
  const nextCode = generateNextStudentCode(String(cohortLetter), codesArray);

  res.json({
    success: true,
    data: {
      cohortLetter,
      nextStudentCode: nextCode,
    },
  });
});

// Data Exchange Package Validation Endpoint
domainRouter.post('/data-exchange/validate', (req, res) => {
  const { package: pkg, existingStudentCodes = [] } = req.body;
  if (!pkg) {
    return res.status(400).json({ success: false, error: 'Package payload missing' });
  }

  const validation = validateExchangePackage(pkg as NagahDataExchangePackage, existingStudentCodes);
  res.json({
    success: true,
    data: validation,
  });
});
