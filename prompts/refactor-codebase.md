# Refactor Codebase with Agent Team

## Simple (refactoring ciblé)

```
Refactore le module [MODULE/DOSSIER].

Crée une agent team :
- "analyst": analyse le code actuel, identifie les code smells et propose un plan de refactoring (plan approval required)
- "refactorer": applique le refactoring après approval (bloqué par analyst)
- "tester": vérifie que tous les tests passent, ajoute les tests manquants (bloqué par refactorer)

Chaque étape dépend de la précédente. Aucun changement de comportement — refactoring pur.
```

## Migration technique (changement de stack)

```
Migre [DESCRIPTION : ex. "de Express à Hono", "de JavaScript à TypeScript", "de REST à tRPC"].

Crée une agent team avec un teammate par zone :
- "architect": définit la stratégie de migration et l'ordre des fichiers dans docs/migration-plan.md (plan approval required)
- "migrator-1": migre [DOSSIER 1] (bloqué par architect)
- "migrator-2": migre [DOSSIER 2] (bloqué par architect)
- "migrator-3": migre [DOSSIER 3] (bloqué par architect)
- "tester": lance les tests après chaque migration, reporte les régressions (bloqué par migrators)

Sonnet pour les migrators et tester, Opus pour architect.
Chaque migrator owns ses fichiers — aucun chevauchement.
Les tests doivent passer à chaque étape, pas seulement à la fin.
```

## Restructuration d'architecture (gros refactoring)

```
Restructure la codebase [REPO/DOSSIER].
Objectif : [ex. "passer d'un monolithe à des modules découplés", "appliquer clean architecture", "séparer domain/infra"]

Crée une agent team :

Phase 1 — Audit :
- "auditor": cartographie les dépendances, identifie le couplage, documente dans docs/audit.md
- "debt-mapper": liste la dette technique, les anti-patterns, les fichiers les plus complexes dans docs/tech-debt.md

Phase 2 — Design (bloqué par phase 1) :
- "architect": propose la nouvelle structure en se basant sur l'audit (plan approval required), produit docs/new-architecture.md

Phase 3 — Implémentation (bloqué par phase 2) :
- "mover-1": restructure [LAYER 1 : ex. src/domain/]
- "mover-2": restructure [LAYER 2 : ex. src/infra/]
- "mover-3": restructure [LAYER 3 : ex. src/api/]

Phase 4 — Validation (bloqué par phase 3) :
- "tester": vérifie que tous les tests passent, corrige les imports cassés
- "watchdog": compare le comportement avant/après, vérifie qu'il n'y a aucune régression fonctionnelle

Opus pour architect et watchdog, Sonnet pour le reste.
Mode délégation activé. Aucun changement de comportement attendu.
```

## Nettoyage rapide (dette technique)

```
Nettoie la dette technique dans [DOSSIER].

Crée une agent team :
- "dead-code": supprime le code mort, imports inutilisés, variables non référencées
- "duplicates": identifie et factorise le code dupliqué
- "types": renforce le typage (any → types explicites, ajout de validations aux frontières)

Chaque agent owns des fichiers différents. Les tests doivent passer après chaque changement.
Pas de refactoring d'architecture — nettoyage cosmétique uniquement.
```
