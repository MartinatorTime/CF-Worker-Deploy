export async function extractLastMatches(text, username) {
    const matchesRegex = /var imp_matches = (\[.*?\])/s;
    const matchesMatch = text.match(matchesRegex);
  
    if (!matchesMatch) {
      return null;
    }
  
    const matches = JSON.parse(matchesMatch[1]);
    const rankedMatches = matches.filter(match => match.ranked).slice(0, 15);
    
    let output = `\n—————————————————\nLast Ranked Matches:\n|🔀Matches : Wins|🔪Kills : Deaths|\n|🔱RP : Change|\n`;
    
    rankedMatches.forEach((match, index) => {
      let rpDeltaFormatted = "";
      
      if (match.rankPointsDelta > 0) {
        rpDeltaFormatted = `📈${match.rankPoints} : +${match.rankPointsDelta}`;
      } else if (match.rankPointsDelta < 0) {
        rpDeltaFormatted = `📉${match.rankPoints} : ${match.rankPointsDelta}`;
      } else {
        rpDeltaFormatted = `🔄${match.rankPoints} : ${match.rankPointsDelta}`;
      }
      
      if (match.matches === match.wins) {
        output += `\n|✅️ ${match.matches} : ${match.wins}  |🔪${match.kills} : ${match.deaths} |${rpDeltaFormatted} |\n—————————————————`;
      } else if (match.matches > match.wins && match.wins !== 0) {
        output += `\n|☑️ ${match.matches} : ${match.wins}  |🔪${match.kills} : ${match.deaths} |${rpDeltaFormatted} |\n—————————————————`;
      } else if (match.wins === 0) {
        output += `\n|❌️ ${match.matches} : ${match.wins}  |🔪${match.kills} : ${match.deaths} |${rpDeltaFormatted} |\n—————————————————`;
      }
    });
    
    return { username, stats: output };
  }