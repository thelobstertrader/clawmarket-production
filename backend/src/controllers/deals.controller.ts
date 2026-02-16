import type { Request, Response, NextFunction } from 'express';
import {
  createDeal,
  listDeals,
  getDeal,
  updateDeal,
  acceptDeal,
  completeDeal,
  cancelDeal,
} from '../services/deals.service.js';
import { dealQuerySchema } from '../schemas/deals.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await createDeal(req.agent!.id, req.body);
    res.status(201).json({ deal });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = dealQuerySchema.parse(req.query);
    const result = await listDeals(req.agent!.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await getDeal(req.params.id, req.agent!.id);
    res.json({ deal });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await updateDeal(req.params.id, req.agent!.id, req.body);
    res.json({ deal });
  } catch (err) {
    next(err);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await acceptDeal(req.params.id, req.agent!.id);
    res.json({ deal });
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await completeDeal(req.params.id, req.agent!.id);
    res.json({ deal });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const deal = await cancelDeal(req.params.id, req.agent!.id);
    res.json({ deal });
  } catch (err) {
    next(err);
  }
}
