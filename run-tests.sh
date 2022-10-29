#!/usr/bin/env bash

echo "Установка зависимостей"
npm i
echo "Запуск теста линтера"
npm run lint
echo "Запуск тестов"
npm run test
echo "Запуск ts компиляции"
npm run ts
exit 0