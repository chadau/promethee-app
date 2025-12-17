# 🎨 Charte Graphique – Projet **PROMÉTHÉE**

Interface de supervision pour **drone autonome solaire**  
Version : 1.0  
Contexte : Dashboard de contrôle – centre de commande aéronautique

---

## 1. 🧭 Identité visuelle

### Logotype
![Logo Prométhée](C:/Users/Shadow/.gemini/antigravity/brain/ef9e769d-4357-4145-be20-e54844d3101c/uploaded_image_1765735552098.jpg)

### Positionnement
* **Technologique & futuriste**
* **Symbolique** : L'aile stylisée évoque le drone, la liberté et la protection (forme de bouclier subtile).
* **Aéronautique / spatial**
* **Haute fiabilité & précision**

### Ambiance
* **Symbiose** : Alliance entre technologie (lignes épurées) et énergie (cœur lumineux).
* Centre de contrôle nocturne (Dark Mode).
* Interfaces sombres à fort contraste.

### Style global
* Minimaliste & Géométrique.
* **Gradients** : Utilisation de dégradés subtils (Cyan vers Bleu Profond) inspirés du logo.
* UI réaliste.

---

## 2. 🎨 Palette de couleurs

### Couleurs principales

| Usage             | Nom         | HEX       | Description                          |
| ----------------- | ----------- | --------- | ------------------------------------ |
| Fond principal    | Dark Core   | `#0B0F12` | Fond global de l’application         |
| Panneaux / cartes | Dark Panel  | `#1A1F24` | Cartes, widgets, blocs UI            |
| **Accent Logo**   | **Logo Cyan**| `#00E5FF` | **Base du gradient du logo**         |
| Accent principal  | Neon Cyan   | `#00BFFF` | Éléments actifs, focus, trajectoires |
| Accent secondaire | Solar Amber | `#FFB347` | Énergie solaire, alertes douces      |
| Succès / OK       | Tech Green  | `#34E0A1` | Connexion, statut valide             |
| Alerte critique   | Alert Red   | `#FF5E5E` | Erreurs, pertes de signal            |

### Texte

| Usage            | Couleur       | HEX       |
| ---------------- | ------------- | --------- |
| Texte principal  | Light Gray    | `#E6EAF0` |
| Texte secondaire | Muted Gray    | `#A1A8B3` |
| Texte désactivé  | Disabled Gray | `#6B7280` |

---

## 3. ✍️ Typographie

### Polices

| Usage               | Police          | Poids           |
| ------------------- | --------------- | --------------- |
| Titres & navigation | **Inter**       | SemiBold (600)  |
| Texte principal     | **Roboto**      | Regular (400)   |
| Données techniques  | **Roboto Mono** | Medium (500)    |
| Logo                | **Inter**       | ExtraBold (800) |

### Règles typographiques
* Chiffres toujours en **Roboto Mono**
* Titres courts, lisibles, jamais en italique
* Capitales réservées au **logo et statuts**

---

## 4. 🧩 Composants UI

### Barre supérieure (Top Bar)
* Fond : `#0E1419` (90% opacity)
* Logo à gauche : **PROMÉTHÉE**
* Indicateur de mission :
  * Actif → Cyan
  * En attente → Gris
  * Alerte → Ambre / Rouge

### Sidebar
* Fond : `#12171C`
* Icônes minimalistes (outline)
* Élément actif :
  * Texte cyan
  * Halo lumineux léger
  * Barre latérale ou glow

### Cartes de télémétrie
* Fond : `#1A1F24`
* Radius : `12px`
* Ombre :
  ```css
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  ```
* Valeur clé :
  * Couleur claire ou cyan
  * Taille > label

### Carte 3D (Map)
* Style satellite / terrain réaliste
* Drone :
  * Icône cyan stylisée
* Trajectoire :
  * Ligne bleue lumineuse
* Waypoints :
  * Cercles cyan ou ambre
* Bordure douce + glow externe

### Zone de commandes (Bottom Panel)
* Boutons :
  * Fond sombre
  * Hover : cyan léger
* Actions critiques :
  * Takeoff / Land → validation visuelle claire
* Joystick :
  * Cercle avec anneau lumineux
* Console MAVLink :
  * Police mono
  * Texte vert / cyan
  * Fond très sombre

---

## 5. 💡 Effets visuels

### Glassmorphism
* Fond semi-transparent
* Flou d’arrière-plan :
  ```css
  backdrop-filter: blur(12px);
  ```

### Lueurs (Glow)
* Utilisées uniquement pour :
  * Éléments actifs
  * Données critiques
* Exemple :
  ```css
  box-shadow: 0 0 12px rgba(0,191,255,0.35);
  ```

### Animations
* Douces et rapides
* Types :
  * Fade in / out
  * Slide horizontal léger
* Durée recommandée : `150–250ms`

---

## 6. 🧠 Règles UX

* **Jamais de surcharge visuelle**
* Une information critique = un point lumineux
* Lisible à distance (grand écran)
* Priorité à la télémétrie > esthétique

---

## 7. 🧪 Mots-clés design

> Autonomie – Précision – Contrôle – Énergie solaire – Sécurité – Intelligence embarquée
