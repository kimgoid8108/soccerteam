import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // DB 연결 환경변수 확인
  const dbEnv =
    process.env.DATABASE_URL ||
    (process.env.DB_HOST &&
      process.env.DB_PORT &&
      process.env.DB_USERNAME &&
      process.env.DB_PASSWORD &&
      process.env.DB_DATABASE)
      ? 'individual'
      : null;

  if (process.env.DATABASE_URL) {
    logger.log(`DATABASE_URL detected: ${process.env.DATABASE_URL}`);
  } else if (dbEnv === 'individual') {
    logger.log(
      `Using individual DB envs: host=${process.env.DB_HOST}, port=${process.env.DB_PORT}, user=${process.env.DB_USERNAME}, database=${process.env.DB_DATABASE}`,
    );
  } else {
    logger.error('No database environment variables found (.env 설정 필요).');
    process.exit(1);
  }

  try {
    const app = await NestFactory.create(AppModule);

    // CORS 환경변수에 따른 동적 설정
    const corsOrigin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : true;

    app.enableCors({
      origin: corsOrigin,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    const port =
      process.env.PORT && !isNaN(Number(process.env.PORT))
        ? Number(process.env.PORT)
        : 3001;
    await app.listen(port, () => {
      logger.log(`Application is running on: http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start application', error);

    if (error.message?.toLowerCase().includes('database')) {
      logger.error('데이터베이스 연결에 실패했습니다. 다음을 확인해주세요:');
      logger.error('1. PostgreSQL이 실행 중인지 확인');
      logger.error(
        '2. .env 파일에 올바른 데이터베이스 정보가 설정되어 있는지 확인',
      );
      logger.error(
        '3. DATABASE_URL 혹은 DB_ 개별 환경변수가 정확히 입력되어 있는지 확인',
      );
      logger.error('4. 데이터베이스 및 계정이 생성되어 있는지 확인');
    }
    process.exit(1);
  }
}
bootstrap();
