import cron from "node-cron";
import TokenRepository from "../repositories/token.repository";
import { cleanTokenLogger } from "../libs/logger/auth.logger";

cron.schedule("*/10 * * * *", async () => {
  const now = new Date();
  const cleanupThreshold = new Date(Date.now() - 30 * 60 * 1000);

  try {
    const expTokens = await TokenRepository.markStatusTokensExpired(now);
    cleanTokenLogger.info({
      event: "expired_token_marked",
      message: `Marked ${expTokens.count} token(s) as EXPIRED`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    cleanTokenLogger.error({
      event: "mark_tokens_exp_failed.",
      error: error.message || error,
      timestamp: new Date().toISOString(),
    });
    console.error("[CRON] Failed to mark expired tokens:", error);
  }

  try {
    const deleted = await TokenRepository.deleteTokensExpiredAndUsed(
      cleanupThreshold
    );
    cleanTokenLogger.info({
      event: "expired_token_deleted",
      message: `Deleted ${deleted.count} expired/used token(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    cleanTokenLogger.error({
      event: "clean_tokens_failed.",
      error: error.message || error,
      timestamp: new Date().toISOString(),
    });
    console.error("[CRON] Failed to delete old tokens:", error);
  }
});
