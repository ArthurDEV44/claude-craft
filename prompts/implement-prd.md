# Implement PRD with Agent Team

## Simple (auto-discovery)

```
Voici le PRD de mon projet : [CHEMIN/prd.md]

Crée une agent team pour implémenter ce PRD en parallèle.
Analyse le PRD, découpe-le en modules indépendants, et spawn
un teammate par module. Chaque teammate doit :
- Avoir un scope de fichiers exclusif (pas de chevauchement)
- Requérir l'approbation du plan avant de coder
- Écrire les tests pour son module

Utilise le mode délégation — tu coordonnes, tu ne codes pas.
```

## Structuré (contrôle total)

```
Implémente le PRD dans [CHEMIN/prd.md].

Crée une agent team avec ce setup :
- "architect": lit le PRD, conçoit l'architecture dans docs/design.md (plan approval required)
- "backend": implémente l'API dans src/api/ (bloqué par architect)
- "frontend": implémente l'UI dans src/components/ (bloqué par architect)
- "database": crée les migrations dans src/db/ (bloqué par architect)
- "tests": écrit les tests dans tests/ (bloqué par backend + frontend)

Utilise Sonnet pour backend/frontend/database/tests, Opus pour architect.
Active le mode délégation. Attends que chaque phase finisse avant de lancer la suivante.
```

## Avec watchdog (qualité maximale)

```
Implémente le PRD dans [CHEMIN/prd.md].

Crée une agent team :

Phase 1 — Design :
- "architect": analyse le PRD, produit docs/design.md (plan approval required)

Phase 2 — Implémentation (bloqué par phase 1) :
- "backend": src/api/ et src/services/
- "frontend": src/components/ et src/pages/
- "database": src/db/ et migrations/

Phase 3 — Qualité (en parallèle de phase 2) :
- "watchdog": review continu du code des devs, vérifie sécurité + conventions + couverture tests

Phase 4 — Tests (bloqué par phase 2) :
- "tester": tests unitaires + intégration dans tests/

Sonnet pour les devs, Opus pour architect et watchdog.
Mode délégation activé. 5-6 tâches par teammate.
```
