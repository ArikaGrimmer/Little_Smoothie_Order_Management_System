export default defineEventHandler(() => {
  const config = useRuntimeConfig();
  return { redisUrl: config.redisUrl };
});
