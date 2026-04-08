// js/api.js
const ATTACK_DATA_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json";

window.fetchAttackData = async function(onProgress) {
  try {
    if (onProgress) onProgress("Connecting to MITRE ATT&CK repository…");
    const response = await fetch(ATTACK_DATA_URL);
    if (!response.ok) throw new Error('Fetch failed.');
    
    if (onProgress) onProgress("Parsing data…");
    const bundle = await response.json();
    return window.parseStixData(bundle.objects);
  } catch (err) {
    console.error("Failed to load ATT&CK data:", err);
    throw err;
  }
}

window.parseStixData = function(objects) {
  const collections = objects.filter(o => o.type === 'x-mitre-collection');
  const version = collections.length ? collections[0].x_mitre_version : "Archive";

  const rawTactics = objects.filter(o => o.type === 'x-mitre-tactic');
  const rawTechs = objects.filter(o => o.type === 'attack-pattern' && !o.x_mitre_deprecated && !o.revoked);
  const rels = objects.filter(o => o.type === 'relationship' && o.relationship_type === 'subtechnique-of');
  
  const relMap = {};
  rels.forEach(r => { relMap[r.source_ref] = r.target_ref; });

  let tactics = rawTactics.map(rt => {
      let extRef = (rt.external_references || []).find(r => r.source_name === 'mitre-attack');
      return {
          stixId: rt.id, id: extRef ? extRef.external_id : "TAxxxx",
          name: rt.name, shortname: rt.x_mitre_shortname,
          description: rt.description || "", techniques: []
      };
  });

  const TACTIC_ORDER = [
    "reconnaissance",
    "resource-development",
    "initial-access",
    "execution",
    "persistence",
    "privilege-escalation",
    "defense-evasion",
    "credential-access",
    "discovery",
    "lateral-movement",
    "collection",
    "command-and-control",
    "exfiltration",
    "impact"
  ];

  tactics.sort((a,b) => {
      let idxA = TACTIC_ORDER.indexOf(a.shortname);
      let idxB = TACTIC_ORDER.indexOf(b.shortname);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
  });

  let tMap = {};
  tactics.forEach(t => tMap[t.shortname] = t);

  let tTechs = [], sTechs = [], aMap = {};
  rawTechs.forEach(rt => {
      let extRef = (rt.external_references || []).find(r => r.source_name === 'mitre-attack');
      let tech = {
          stixId: rt.id, id: extRef ? extRef.external_id : "", name: rt.name,
          description: rt.description || "", isSub: rt.x_mitre_is_subtechnique || false,
          kill_chain_phases: rt.kill_chain_phases || [], url: extRef ? extRef.url : "",
          platforms: rt.x_mitre_platforms || [], subtechniques: []
      };
      aMap[tech.stixId] = tech;
      if (tech.isSub) sTechs.push(tech); else tTechs.push(tech);
  });

  sTechs.forEach(sub => {
      let pid = relMap[sub.stixId];
      if (pid && aMap[pid]) aMap[pid].subtechniques.push(sub);
  });

  tTechs.forEach(t => {
      let addedTo = new Set();
      t.kill_chain_phases.forEach(kc => {
          if (kc.kill_chain_name === 'mitre-attack' && tMap[kc.phase_name] && !addedTo.has(kc.phase_name)) {
              // Create local copy to manage UI children isolated per tactic if desired
              tMap[kc.phase_name].techniques.push(JSON.parse(JSON.stringify(t)));
              addedTo.add(kc.phase_name);
          }
      });
  });

  tactics.forEach(tactic => {
      tactic.techniques.sort((a,b) => a.name.localeCompare(b.name));
      tactic.techniques.forEach(tech => {
          tech.subtechniques.sort((a,b) => a.name.localeCompare(b.name));
      });
  });

  return { version, tactics };
}
