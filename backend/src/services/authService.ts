import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  studentId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error("Email already registered"), { status: 409 });

    if (data.studentId) {
      const existingId = await prisma.user.findUnique({ where: { studentId: data.studentId } });
      if (existingId) throw Object.assign(new Error("Student ID already registered"), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        studentId: data.studentId || null,
      },
      select: { id: true, name: true, email: true, role: true, studentId: true, createdAt: true },
    });

    await prisma.notificationPreference.create({
      data: { userId: user.id },
    });

    const tokens = generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw Object.assign(new Error("Invalid email or password"), { status: 401 });

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw Object.assign(new Error("Invalid email or password"), { status: 401 });

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
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });
      if (!user) throw Object.assign(new Error("User not found"), { status: 401 });

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return { accessToken };
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
    }
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, studentId: true, createdAt: true },
    });
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
    return user;
  },
};
