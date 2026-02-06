# Code Review PR with Agent Team

## Simple (review multi-angle)

```
Review la PR #[NUMÉRO] du repo [REPO].

Crée une agent team avec 3 reviewers :
- "security": vérifie les failles (injections, XSS, auth, OWASP top 10)
- "performance": analyse l'impact perf (complexité, requêtes N+1, mémoire, bundle size)
- "quality": vérifie couverture tests, lisibilité, conventions du projet

Chaque reviewer doit :
- Lister les issues trouvées avec sévérité (critical/warning/info)
- Citer les fichiers et lignes concernés
- Proposer un fix pour chaque issue

Synthétise en un verdict : approve, request changes, ou block.
```

## Approfondi (review complet)

```
Review la PR #[NUMÉRO] du repo [REPO].
Context : [DESCRIPTION DE CE QUE FAIT LA PR]

Crée une agent team :
- "security": audit sécurité (auth, validation, secrets, dépendances vulnérables)
- "performance": profiling (requêtes DB, algorithmes, lazy loading, caching)
- "architecture": cohérence avec les patterns existants, couplage, séparation des responsabilités
- "tests": couverture, edge cases manquants, qualité des assertions
- "watchdog": lit les reviews des 4 autres, identifie les contradictions, priorise les findings

Opus pour watchdog, Sonnet pour les autres.
Le watchdog produit un rapport final dans docs/review-pr-[NUMÉRO].md avec :
- Résumé des changements
- Issues classées par sévérité
- Verdict final et conditions d'approval
```

## Rapide (review ciblé)

```
Review la PR #[NUMÉRO].

Crée une agent team de review rapide :
- "diff-reader": analyse le diff, résume les changements clés
- "risk-checker": identifie les breaking changes, régressions possibles, et fichiers sensibles touchés

Synthétise en 5 bullet points max : ce qui va, ce qui pose problème.
```
