export class MentionDetector {
  private static readonly mentionRegex = /(^|\s)@([a-zA-Z0-9._-]{3,32})/g;

  static extractMentions(text: string): string[] {
    if (!text) return [];

    const matches = [...text.matchAll(this.mentionRegex)];
    const usernames = matches.map((m) => m[2]);

    return [...new Set(usernames)];
  }

  static isEmail(value: string): boolean {
    return /\S+@\S+\.\S+/.test(value);
  }

  static filterValidMentions(text: string): string[] {
    const raw = this.extractMentions(text);

    return raw.filter(
      (username) =>
        !this.isEmail(username) &&
        username.length >= 3 &&
        username.length <= 32,
    );
  }
}
