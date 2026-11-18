-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'DEANERY_STAFF', 'AUTHOR', 'MODERATOR', 'ADMIN');
CREATE TYPE "RequestStatus" AS ENUM ('SUBMITTED', 'IN_PROGRESS', 'READY', 'REJECTED');
CREATE TYPE "AssessmentType" AS ENUM ('CREDIT', 'DIFFERENTIATED_CREDIT', 'EXAM', 'COURSE_PROJECT');
CREATE TYPE "LessonType" AS ENUM ('LECTURE', 'PRACTICE', 'LABORATORY');
CREATE TYPE "NewsCategory" AS ENUM ('OFFICIAL', 'IMPORTANT', 'SPORT', 'STUDENT_LIFE', 'EVENT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ... (остальные CREATE TABLE по схеме Prisma) ...

-- Уникальный логин без учёта регистра
CREATE UNIQUE INDEX "User_login_lower_key" ON "User" (LOWER("login"));

-- Уникальность лайка
-- (будет сгенерировано Prisma как @@unique, но для ясности)
