# Implement PRD

Exécute un PRD existant : une seule user-story à la fois, ou le PRD entier en parallèle via agent swarm.

## Single user-story

Implémente une US précise en suivant les skills et MCP indiqués dans le PRD.

### FR

```
Implémente l'US-018 du PRD @tasks/prd-veritasq-ux-redesign.md et utilise les skills et MCP recommandés dans l'US, puis quand tu as terminé met à jour le PRD.
```

### EN

```
Implement US-018 from the PRD @tasks/prd-veritasq-ux-redesign.md and use the skills and MCP recommended in the US, then when you're done update the PRD.
```

## Full PRD with agent swarm

Implémente toutes les US du PRD en parallèle avec le swarm natif de Claude Code.

### FR

```
Implémente le PRD @tasks/prd-veritasq-ux-redesign.md et utilise l'agent swarm, les skills et les MCP recommandés dans les US, puis quand tu as terminé met à jour le PRD.
```

### EN

```
Implement the PRD @tasks/prd-veritasq-ux-redesign.md and use the agent swarm, the skills and MCP recommended in the USs, then when you're done update the PRD.
```

## Full PRD with /agent-swarm skill

Comme ci-dessus mais avec le skill /agent-swarm pour orchestrer via tmux. Gère la fermeture des panes et la mise à jour de la checklist.

### FR

```
Implémente le PRD @tasks/prd-llm-review-fixes.md en utilisant les agents swarm avec le skill /agent-swarm. N'oublie pas de fermer les panes tmux des agents une fois qu'ils ont terminé, puis mets à jour la checklist du PRD.
```

### EN

```
Implement the PRD @tasks/prd-llm-review-fixes.md using swarm agents with the /agent-swarm skill. Don't forget to close the agents' tmux panes once they're done, then update the PRD checklist.
```
