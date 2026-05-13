import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Player } from '../players/entities/player.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(@InjectModel(Player) private playerModel: typeof Player) {}

  async analyzePlayer(id: number): Promise<{ narrative: string; source: string }> {
    // Fetch all timeline records for this player
    const base = await this.playerModel.findByPk(id);
    if (!base) {
      return { narrative: 'Player not found.', source: 'stub' };
    }

    const records = await this.playerModel.findAll({
      where: { long_name: base.long_name, gender: base.gender },
      attributes: [
        'fifa_version', 'overall', 'potential', 'age',
        'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
      ],
      order: [['fifa_version', 'ASC']],
    });

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      return this.callOpenAI(base.long_name, records, apiKey);
    }

    // ── STUB narrative (no API key) ──────────────────────────────────────────
    return this.generateStubNarrative(base.long_name, records);
  }

  private async callOpenAI(
    playerName: string,
    records: Player[],
    apiKey: string,
  ): Promise<{ narrative: string; source: string }> {
    try {
      const statsText = records
        .map(r => {
          const d = r.toJSON() as any;
          return `FIFA ${d.fifa_version}: Overall=${d.overall}, Age=${d.age}, ` +
            `Pace=${d.pace}, Shooting=${d.shooting}, Passing=${d.passing}, ` +
            `Dribbling=${d.dribbling}, Defending=${d.defending}, Physical=${d.physic}`;
        })
        .join('\n');

      const prompt = `You are a FIFA analyst. Analyze the career evolution of ${playerName} ` +
        `based on the following yearly stats from FIFA games (2015–2023).\n\n${statsText}\n\n` +
        `Write a concise 3–4 sentence narrative describing the player's trajectory, ` +
        `highlighting peaks, declines, and any notable transitions. Write in English.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await response.json() as any;
      const narrative = data?.choices?.[0]?.message?.content ?? 'Analysis unavailable.';
      return { narrative, source: 'openai-gpt4o-mini' };
    } catch (err) {
      this.logger.error('OpenAI call failed, falling back to stub', err.message);
      return this.generateStubNarrative(playerName, records);
    }
  }

  private generateStubNarrative(
    playerName: string,
    records: Player[],
  ): { narrative: string; source: string } {
    if (records.length === 0) {
      return {
        narrative: `${playerName} has no historical data available in the database.`,
        source: 'stub',
      };
    }

    const data = records.map(r => r.toJSON() as any);
    const first = data[0];
    const last = data[data.length - 1];
    const peak = data.reduce((a, b) => (b.overall > a.overall ? b : a), data[0]);

    const overallChange = (last.overall ?? 0) - (first.overall ?? 0);
    const trend = overallChange > 0 ? 'improving' : overallChange < 0 ? 'declining' : 'stable';

    const narrative =
      `${playerName} has been tracked across ${records.length} FIFA edition(s), ` +
      `starting at an overall of ${first.overall} (FIFA ${first.fifa_version}) ` +
      `and reaching ${last.overall} in FIFA ${last.fifa_version}. ` +
      `Their career trajectory appears ${trend} overall, ` +
      `with a peak overall rating of ${peak.overall} recorded in FIFA ${peak.fifa_version}. ` +
      (peak.pace ? `Notable attributes include pace (${peak.pace}) and dribbling (${peak.dribbling}), ` : '') +
      `reflecting the player's strengths over their career. ` +
      `(Connect an OpenAI API key in .env to enable AI-generated analysis.)`;

    return { narrative, source: 'stub' };
  }
}
