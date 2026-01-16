import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // DATABASE_URL 로드 확인 (디버깅용)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    logger.log(
      `DATABASE_URL detected: ${url.protocol}//${url.hostname}:${url.port}/${url.pathname.slice(1)}`,
    );
  } else {
    logger.warn(
      'DATABASE_URL not found, using individual DB environment variables',
    );
  }

  try {
    const app = await NestFactory.create(AppModule);

    // CORS 설정 추가
    app.enableCors({
      origin:
        process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ||
        true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    if (error.message?.includes('database')) {
      logger.error('데이터베이스 연결에 실패했습니다. 다음을 확인해주세요:');
      logger.error('1. PostgreSQL이 실행 중인지 확인');
      logger.error(
        '2. .env 파일에 올바른 데이터베이스 정보가 설정되어 있는지 확인',
      );
      logger.error('3. 데이터베이스가 생성되어 있는지 확인');
    }
    process.exit(1);
  }
}
bootstrap();
