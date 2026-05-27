import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { prisma } from "@/common/prisma/client";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/errors/app-error";
import type { LoginInput, RegisterInput } from "@/modules/auth/auth.schema";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError("Email already registered");

    if (data.studentId) {
      const existingId = await prisma.user.findUnique({
        where: { studentId: data.studentId },
      });
      if (existingId) throw new ConflictError("Student ID already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        studentId: data.studentId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        createdAt: true,
      },
    });

    await prisma.notificationPreference.create({
      data: { userId: user.id },
    });

    const tokens = generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const tokens = generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
      ...tokens,
    };
  },

  async refresh(refreshToken: string) {
    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new UnauthorizedError("User not found");

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    return { accessToken };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },
};
