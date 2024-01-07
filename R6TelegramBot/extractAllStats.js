export function extractAllStats(text, username) {
  const latestRpRegex = /Latest RP <span class="trn-text--primary">(.+)<\/span><\/div>[\s\S]*?<div class="trn-text--dimmed" style="font-size: 1.5rem;">(.+)<\/div>[\s\S]*?<div style="font-family: Rajdhani; font-size: 3rem;">([\d,]+)<\/div>[\s\S]*?<span class="trn-text--dimmed" style="width: 55px;">Ranked<\/span>[\s\S]*?<span>([\d.]+) <span class="trn-text--dimmed">KD<\/span><\/span>/;
  const highestBySeasonRegex = /<div class="r6-quickseason__label" style="color: .+;">(.+)<\/div>[\s\S]*?<span class="r6-quickseason__value">([\d,]+)<\/span>[\s\S]*?<small class="r6-quickseason__rank trn-text--dimmed">(.+)<\/small>[\s\S]*?<small class="r6-quickseason__value trn-text--dimmed" style="font-size: 1.5rem;">Matches (\d+)<\/small>[\s\S]*?<small class="r6-quickseason__value trn-text--dimmed" style="font-size: 1.5rem;">•<\/small>[\s\S]*?<small class="r6-quickseason__value trn-text--dimmed" style="font-size: 1.5rem;">K\/D ([\d.]+)<\/small>/g;

  const latestRpMatch = latestRpRegex.exec(text);

  if (!latestRpMatch) {
    return null;
  }

  let latestRpOutput = `\n—————————————————\n🌈Season: ${latestRpMatch[1]}\n🆙️Rank: ${latestRpMatch[2]}\n🔱Rank Points: ${latestRpMatch[3]}\n🔪Kills/Deaths: ${latestRpMatch[4]}`;

  // Combine the regex patterns into a single pattern
  const statsRegex = /<div class="trn-defstat__name">(Level|Kills\/match|Win %)<\/div>\s*<div class="trn-defstat__value(?:-stylized)?" data-stat="(?:RankedKillsPerMatch|RankedWLRatio)">\s*([\d.]+|%|\d+)\s*/g;
  let statsMatch;

  while ((statsMatch = statsRegex.exec(text)) !== null) {
    switch (statsMatch[1]) {
      case 'Level':
        latestRpOutput += `\n📊Level: ${statsMatch[2]}`;
        break;
      case 'Kills/match':
        latestRpOutput += `\n⚔️Kills/Match: ${statsMatch[2]}`;
        break;
      case 'Win %':
        latestRpOutput += `\n📈Win/Rate: ${statsMatch[2]}`;
        break;
    }
  }

  latestRpOutput += `\n—————————————————\n===  Highest By Seasons  ===`;

  let hasStats = false;

  while ((statsMatch = highestBySeasonRegex.exec(text)) !== null) {
    hasStats = true;
    latestRpOutput += `\n—————————————————\nSeason: ${statsMatch[1]}\nMaxRank: ${statsMatch[3]}\nRank Points: ${statsMatch[2]}\nKD: ${statsMatch[5]}\nMatches: ${statsMatch[4]}`;
  }

  return hasStats ? { username, stats: latestRpOutput } : null;
}
