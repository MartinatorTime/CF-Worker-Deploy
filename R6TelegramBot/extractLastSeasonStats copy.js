
export function extractLastSeasonStats(text, username) {
    const latestRpRegex = /<div class="trn-card__content-title" style="padding: 0 0 1.5rem;">Latest RP <span class="trn-text--primary">(.+)<\/span><\/div>[\s\S]*?<div class="trn-text--dimmed" style="font-size: 1.5rem;">(.+)<\/div>[\s\S]*?<div style="font-family: Rajdhani; font-size: 3rem;">([\d,]+)<\/div>[\s\S]*?<span class="trn-text--dimmed" style="width: 55px;">Ranked<\/span>[\s\S]*?<span>([\d.]+) <span class="trn-text--dimmed">KD<\/span><\/span>/;
    const latestRpMatch = text.match(latestRpRegex);
  
    if (!latestRpMatch) {
      return null;
    }
  
    let latestRpOutput = `\n—————————————————\n🌈Season: ${latestRpMatch[1]}\n🆙️Rank: ${latestRpMatch[2]}\n🔱Rank Points: ${latestRpMatch[3]}\n🔪Kills/Deaths: ${latestRpMatch[4]}`;
  
    // Extract the Level value using regex
    const levelRegex = /<div class="trn-defstat__name">Level<\/div>\s*<div class="trn-defstat__value-stylized">\s*(\d+)\s*<\/div>/;
    const levelMatch = text.match(levelRegex);
    const killsPerMatchRegex = /<div class="trn-defstat__name">Kills\/match<\/div>\s*<div class="trn-defstat__value" data-stat="RankedKillsPerMatch">\s*([\d.]+)\s*/;
    const killsPerMatchMatch = text.match(killsPerMatchRegex);
    const winPercentageRegex = /<div class="trn-defstat__name">Win %<\/div>\s*<div class="trn-defstat__value" data-stat="RankedWLRatio">\s*([\d.]+)%\s*/;
    const winPercentageMatch = text.match(winPercentageRegex);
    const matchesRegex = /<small class="r6-quickseason__value trn-text--dimmed" style="font-size: 1.5rem;">Matches (\d+)<\/small>/;
    const matchesMatch = text.match(matchesRegex);
    const abandonsRegex = /<div class="trn-defstat__name">Abandons<\/div>\s*<div class="trn-defstat__value">([\d,]+)<\/div>/;
    const abandonsMatch = text.match(abandonsRegex);

    if (killsPerMatchMatch) {
        latestRpOutput += `\n⚔️Kills/Match: ${killsPerMatchMatch[1]}`;
    }
    if (winPercentageMatch) {
        latestRpOutput += `\n📈Win/Rate: ${winPercentageMatch[1]}%`;
    }
    if (matchesMatch) {
        latestRpOutput += `\n🏁Matches: ${matchesMatch[1]}`;
    }
    if (abandonsMatch) {
      latestRpOutput += `\n⛔️ Abandons: ${abandonsMatch[1]}`;
    }
    if (levelMatch) {
        latestRpOutput += `\n📊Level: ${levelMatch[1]}`;
    }
  
    // Add the link with the username
      latestRpOutput += `\n📎: https://r6.tracker.network/profile/psn/${username}`;
  
    return { username, stats: latestRpOutput };
  }