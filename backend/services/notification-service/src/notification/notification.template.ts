/** Shape returned by the template factory. */
export interface NotificationPayload {
  title: string;
  body: string;
}

/**
 * Pure, stateless template factory.
 * All methods are static so no DI wiring is needed — import and call directly.
 */
export class NotificationTemplate {
  /**
   * Builds a motivational progress notification for the daily tasks screen.
   *
   * Edge-cases handled:
   *  - 0 total tasks  → encourages the user to add tasks
   *  - all completed  → celebrates completion
   *  - none completed → gentle nudge to start
   *  - in-progress    → shows X/Y with percentage and remaining count
   */
  static buildDailyProgress(
    totalTasks: number,
    completedTasks: number,
  ): NotificationPayload {
    const title = '📋 Your Daily Progress Update';

    if (totalTasks <= 0) {
      return {
        title,
        body: "🌱 You haven't set any tasks yet. Open the app and plan your day!",
      };
    }

    // Clamp completed to valid range (defensive against bad upstream data).
    const completed = Math.min(Math.max(0, completedTasks), totalTasks);
    const remaining = totalTasks - completed;
    const percentage = Math.round((completed / totalTasks) * 100);

    if (completed === 0) {
      return {
        title,
        body: `🚀 You have ${totalTasks} task${totalTasks > 1 ? 's' : ''} waiting for you today. Let's get started — every step counts!`,
      };
    }

    if (completed === totalTasks) {
      return {
        title: '🏆 All Tasks Completed!',
        body: `Amazing work! You crushed all ${totalTasks} tasks today. Take a moment to celebrate — you earned it! 🎉`,
      };
    }

    // Determine an emoji-based motivational suffix based on progress band.
    const motivationSuffix = NotificationTemplate.getMotivationSuffix(percentage);

    return {
      title,
      body:
        `🎯 You've completed ${completed} out of ${totalTasks} tasks (${percentage}%). ` +
        `${remaining} task${remaining > 1 ? 's' : ''} left — ${motivationSuffix}`,
    };
  }

  /** Returns an encouraging phrase based on how far along the user is. */
  private static getMotivationSuffix(percentage: number): string {
    if (percentage < 25) return "you're just getting warmed up. Keep going! 💪";
    if (percentage < 50) return "great start! You're building momentum. 🔥";
    if (percentage < 75) return "you're past the halfway mark. Finish strong! ⚡";
    return "almost there! You're so close to the finish line! 🏁";
  }
}