# RiverReady: Step-by-Step Setup and Testing Guide

This guide is for people who have **never set up a coding project before**. It takes you from the GitHub link all the way to running RiverReady on your computer and testing it on your phone.

Set aside about **45–60 minutes** the first time. Most of that is downloading and installing programs. After the first time, starting the app takes about 1 minute (see [Part 9](#part-9-starting-the-app-again-next-time)).

> **What is RiverReady?** It's a student project, a small web app where you can search UK river monitoring stations, save locations and keep a flood-preparedness checklist for each one. It shows live river levels from the Environment Agency.
> **It is educational only. It is not an official flood warning service and not safety advice.**

---

## Contents

1. [What you are about to do (the big picture)](#part-1-the-big-picture)
2. [How to open a terminal](#part-2-how-to-open-a-terminal)
3. [Install the required programs](#part-3-install-the-required-programs) (Windows / Mac / Linux)
4. [Download the project from GitHub](#part-4-download-the-project-from-github)
5. [Set up the database](#part-5-set-up-the-database)
6. [Connect the app to the database (config file)](#part-6-connect-the-app-to-the-database)
7. [Run the app](#part-7-run-the-app)
8. [Open it on your phone](#part-8-open-it-on-your-phone)
9. [Starting the app again next time](#part-9-starting-the-app-again-next-time)
10. [Install it as an app (PWA)](#part-10-install-it-as-an-app-pwa)
11. [Test everything (checklist)](#part-11-test-everything-checklist)
12. [Troubleshooting](#part-12-troubleshooting)
13. [Glossary](#part-13-glossary)

---

## Part 1: The big picture

RiverReady has **three parts**, and all three must be running at the same time:

| Part | What it does | Program that runs it |
|---|---|---|
| **Database** | Stores your saved locations and checklists | **MariaDB** (or MySQL) |
| **Backend** (the "server") | Talks to the database and fetches live river data from the Environment Agency | **PHP** |
| **Frontend** (the website you see) | The screens, buttons and forms | **Node.js** (using a tool called Vite) |

You will also need **Git**, which downloads the project from GitHub.

When everything is running you'll have **two terminal windows open**, one for the backend and one for the frontend, and the database running in the background. You then open the app in your web browser.

```
 Phone / Browser  ──►  Frontend (port 5173)  ──►  Backend (port 8000)  ──►  Database
                                                        │
                                                        └──►  Environment Agency (internet)
```

---

## Part 2: How to open a terminal

A **terminal** is a window where you type commands instead of clicking. You'll use it a lot in this guide. Whenever you see a grey box like this:

```
some command here
```

…type it (or copy and paste it) into the terminal and press **Enter**.

| Your computer | How to open a terminal |
|---|---|
| **Windows** | Press the **Windows key**, type **`cmd`**, click **Command Prompt**. ⚠️ Use **Command Prompt**, *not* PowerShell. Some commands in this guide behave differently in PowerShell. |
| **Mac** | Press **Cmd + Space**, type **`Terminal`**, press Enter. |
| **Linux** | Press **Ctrl + Alt + T**, or find "Terminal" in your apps. |

**Tips:**
- **To paste:** in Windows Command Prompt, right-click or press Ctrl + V. On Mac use Cmd + V. In a Linux terminal use **Ctrl + Shift + V**.
- If a command is "still running" and you want to stop it, press **Ctrl + C**.
- If a password prompt shows **nothing** as you type, that's normal. The characters are hidden. Type it and press Enter.

---

## Part 3: Install the required programs

Follow **only the section for your computer**.

### 3A. Windows

You'll install 3 things: **Git**, **Node.js** and **XAMPP**. XAMPP is a free bundle that gives you **both PHP and MariaDB** in one installer.

**1. Git**
1. Go to **https://git-scm.com/download/win**. The download should start automatically.
2. Run the installer. **Click "Next" on every screen** (the defaults are fine), then "Install", then "Finish".

**2. Node.js**
1. Go to **https://nodejs.org**.
2. Download the version marked **"LTS"** (it must be **version 22 or newer**).
3. Run the installer and click "Next" through all screens (defaults are fine). If it offers "Tools for Native Modules", you can leave that **unticked**.

**3. XAMPP (PHP + database)**
1. Go to **https://www.apachefriends.org** and download **XAMPP for Windows** (choose a version with **PHP 8.1 or newer**, which is any recent one).
2. Run the installer. If Windows warns about "User Account Control", click OK. Install it to the default folder **`C:\xampp`**. **This matters, because later commands use this path.**
3. When finished, open the **XAMPP Control Panel** (from the Start menu).
4. Click **Start** next to **MySQL**. It should turn green.
   - You do **not** need to start Apache.
   - If Windows Firewall asks about "mysqld", click **Allow**.

**4. Check everything installed.** **Close any open Command Prompt windows and open a new one**, because new programs are only recognised in new windows. Then run these one at a time:

```
git --version
node --version
npm --version
C:\xampp\php\php.exe --version
```

Each should print a version number. `node` should show **v22** or higher, and PHP should show **8.1 or higher**.

Then check that PHP has the two add-ons the app needs:

```
C:\xampp\php\php.exe -m | findstr /i "pdo_mysql curl"
```

You should see both **`curl`** and **`pdo_mysql`** in the output. (XAMPP includes them by default.)

> **On Windows, wherever this guide says `php`, type `C:\xampp\php\php.exe` instead,
> and wherever it says `mariadb`, type `C:\xampp\mysql\bin\mysql.exe` instead.**
> The commands in Parts 5 and 7 already show the Windows version for you.

### 3B. Mac

On a Mac we use **Homebrew**, a free tool that installs other programs with one command.

**1. Install Homebrew.** Open Terminal and paste this (it's one line):

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- It will ask for your **Mac login password** (it stays invisible while you type, which is normal).
- It may ask you to install "Command Line Tools". Say yes.
- **Important:** when it finishes, it prints a **"Next steps"** section with 1–2 commands to run. **Copy and run those commands.** Without them, `brew` won't be found.

**2. Install everything else:**

```
brew install git node php mariadb
```

**3. Start the database (and have it start automatically from now on):**

```
brew services start mariadb
```

**4. Check:**

```
git --version
node --version
php --version
php -m | grep -iE "pdo_mysql|curl"
```

`node` must be **v22+** and PHP **8.1+**, and the last command must show **curl** and **pdo_mysql**.

### 3C. Linux

**Fedora:**

```
sudo dnf install git nodejs npm php-cli php-mysqlnd mariadb-server
sudo systemctl enable --now mariadb
```

**Ubuntu / Debian / Linux Mint:**

```
sudo apt update
sudo apt install git php-cli php-mysql php-curl mariadb-server curl
sudo systemctl enable --now mariadb
```

On Ubuntu the `nodejs` package is often **too old**, so install Node with **nvm** instead:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

**Close the terminal, open a new one**, then:

```
nvm install 22
```

**Check (all Linux):**

```
git --version
node --version
php --version
php -m | grep -iE "pdo_mysql|curl"
```

`node` must be **v22+** and PHP **8.1+**, and the last command must show **curl** and **pdo_mysql**.

---

## Part 4: Download the project from GitHub

1. Open the **GitHub link** you were sent in your browser. You'll see the project's files.
2. Click the green **`<> Code`** button and copy the **HTTPS** link. It looks like `https://github.com/SOMEONE/riverready.git`.
3. In your terminal, choose where to put the project. This example uses your **Documents** folder:

   **Windows:**
   ```
   cd %USERPROFILE%\Documents
   ```
   **Mac / Linux:**
   ```
   cd ~/Documents
   ```

4. Download ("clone") the project. Replace the link with the one you copied:

   ```
   git clone https://github.com/SOMEONE/riverready.git
   ```

5. Go into the project folder:

   ```
   cd riverready
   ```

   > If the folder has a different name, type `dir` (Windows) or `ls` (Mac/Linux) to see what was created, and `cd` into that.

6. Check you're in the right place. Type `dir` (Windows) or `ls` (Mac/Linux). You should see folders called **`backend`** and **`frontend`**.

> **No Git?** As an alternative you can click **`<> Code` → Download ZIP** on GitHub, unzip it into Documents and `cd` into the unzipped folder. Git is recommended because it makes updating easier (`git pull`).

**⚠️ From now on, every command assumes your terminal is inside this `riverready` folder** (the one containing `backend` and `frontend`) unless the guide says otherwise.

---

## Part 5: Set up the database

You'll create an empty database called `riverready`, a database user that the app logs in as, and then load the tables and some demo data.

**Step 1: Open the database console as the administrator ("root").**

| Computer | Command |
|---|---|
| **Windows (XAMPP)** | `C:\xampp\mysql\bin\mysql.exe -u root` (XAMPP's root has **no password**; if asked, just press Enter) |
| **Mac (Homebrew)** | `sudo mariadb` (enter your Mac password) |
| **Linux** | `sudo mariadb` (enter your Linux password) |

You should now see a prompt like `MariaDB [(none)]>`. You're "inside" the database, and commands here end with a **semicolon `;`**.

**Step 2: Create the database and user.** Paste these lines **one at a time**, pressing Enter after each. Replace **`choose_a_password`** with a password you make up (letters and numbers only keeps it simple), and **write it down**, because you need it in Part 6.

```sql
CREATE DATABASE riverready CHARACTER SET utf8mb4;
CREATE USER 'riverready'@'localhost' IDENTIFIED BY 'choose_a_password';
GRANT ALL PRIVILEGES ON riverready.* TO 'riverready'@'localhost';
FLUSH PRIVILEGES;
```

Each should reply `Query OK`.

**Step 3: Load the tables and demo data.**

```sql
USE riverready;
SOURCE backend/database/schema.sql;
```

You'll see several `Query OK` lines. This works because your terminal is inside the `riverready` project folder.
> If you get `Failed to open file`, type `exit`, `cd` into the project folder (Part 4) and repeat Step 1, then this step.

**Step 4: Check it worked:**

```sql
SELECT id, name FROM locations;
```

You should see a small table of demo locations.

**Step 5: Leave the database console:**

```sql
exit
```

> ⚠️ Running `schema.sql` again later **erases all saved data** and restores the demo data. That's useful as a "reset" button, but don't do it by accident.

---

## Part 6: Connect the app to the database

The backend needs to know the database password. It reads it from a file called **`config.php`**, which is **not** on GitHub (passwords must never be uploaded). You'll make your own copy from the provided sample.

**Step 1: Copy the sample file:**

**Windows:**
```
copy backend\config\config.sample.php backend\config\config.php
```
**Mac / Linux:**
```
cp backend/config/config.sample.php backend/config/config.php
```

**Step 2: Open it in a text editor:**

**Windows:**
```
notepad backend\config\config.php
```
**Mac:**
```
open -e backend/config/config.php
```
**Linux:**
```
nano backend/config/config.php
```

**Step 3:** Find this line:

```php
        'pass' => 'CHANGE_ME',
```

Replace `CHANGE_ME` with the password you chose in Part 5, **keeping the quote marks**. For example:

```php
        'pass' => 'choose_a_password',
```

Leave everything else as it is. **Save and close** the file:
- **Notepad:** Ctrl + S, then close.
- **TextEdit (Mac):** Cmd + S, then close.
- **nano (Linux):** Ctrl + O, Enter, then Ctrl + X.

---

## Part 7: Run the app

You need **two terminal windows** open at the same time, both inside the `riverready` folder. Keep both open the whole time you use the app.

### Terminal 1: the backend (PHP server)

In your current terminal (inside `riverready`), run:

**Windows:**
```
C:\xampp\php\php.exe -S localhost:8000 -t backend/public backend/public/index.php
```
**Mac / Linux:**
```
php -S localhost:8000 -t backend/public backend/public/index.php
```

It prints something like `Development Server (http://localhost:8000) started`. **Leave this window open.** It will keep printing a line for every request, which is normal.

**Check it:** open your web browser and go to **http://localhost:8000/api/health**

- ✅ You see text like `{"status":"ok", ...}`. The backend and database are working.
- ❌ You see `503` or an error. The backend can't reach the database. See [Troubleshooting](#part-12-troubleshooting).

### Terminal 2: the frontend (website)

**Open a second terminal window** (see Part 2), go to the project folder again, then into the `frontend` folder:

**Windows:**
```
cd %USERPROFILE%\Documents\riverready\frontend
```
**Mac / Linux:**
```
cd ~/Documents/riverready/frontend
```

**First time only:** download the frontend's building blocks. This takes 1–3 minutes, needs internet, and creates a `node_modules` folder:

```
npm install
```

(Warnings in yellow are normal. Only red **`ERR!`** lines are real problems.)

**Start the frontend:**

```
npm run dev -- --host
```

> The `-- --host` part lets your **phone** connect too. Without it, only this computer can open the app.

It prints something like:

```
  VITE v8.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.23:5173/
```

**Write down the `Network:` address.** That's what you'll type on your phone. (Your numbers will be different.)

**Windows:** a **Windows Defender Firewall** popup may appear for **Node.js**. Tick **"Private networks"** and click **Allow access**. If you skip this, your phone won't be able to connect.

### Open the app on the computer

Go to **http://localhost:5173** in your browser (Chrome, Edge, Firefox or Safari). You should see the RiverReady home page, **"My locations"**, with the demo locations. 🎉

---

## Part 8: Open it on your phone

**Requirements:**
- Your phone and computer must be on the **same Wi-Fi network**.
- Both terminals from Part 7 must still be running.

**Steps:**
1. On your phone, open **Chrome** (Android) or **Safari** (iPhone).
2. In the address bar, type the **`Network:`** address from Part 7 exactly, including `http://` and `:5173`. For example: `http://192.168.1.23:5173`
3. The RiverReady home page should load.

> ⚠️ Typing `localhost` on your phone **won't work**. On a phone, "localhost" means the phone itself. Always use the `Network:` address.

**Doesn't load?** Work through this list:

1. **Same Wi-Fi?** Check that the phone isn't on mobile data or a different network.
2. **Firewall** on the computer is blocking it:
   - **Windows:** Start → "Windows Defender Firewall" → "Allow an app or feature through…" → "Change settings" → find **Node.js** and tick **Private**. Also make sure your Wi-Fi is set to a **Private** network: Settings → Network & Internet → Wi-Fi → (your network) → Network profile: **Private**.
   - **Mac:** System Settings → Network → Firewall. If it's on, click Options and allow **node** incoming connections.
   - **Fedora Linux:** `sudo firewall-cmd --add-port=5173/tcp`
   - **Ubuntu Linux** (only if `ufw` is enabled): `sudo ufw allow 5173/tcp`
3. **Public or university Wi-Fi** (eduroam, café, hotel) often **blocks devices from talking to each other**. Workaround: turn on your **phone's hotspot**, connect the **computer** to it, stop the frontend (Ctrl + C in Terminal 2) and start it again with `npm run dev -- --host`. Then use the **new** `Network:` address it prints.
4. **No `Network:` line shown?** You forgot `-- --host`. Stop with Ctrl + C and run `npm run dev -- --host` again.

---

## Part 9: Starting the app again next time

You only do Parts 3–6 **once**. Next time:

1. **Database running?**
   - Windows: open the **XAMPP Control Panel** → **Start** MySQL.
   - Mac/Linux: it starts automatically (it was set up to).
2. **Terminal 1** (in the `riverready` folder):
   - Windows: `C:\xampp\php\php.exe -S localhost:8000 -t backend/public backend/public/index.php`
   - Mac/Linux: `php -S localhost:8000 -t backend/public backend/public/index.php`
3. **Terminal 2** (in the `riverready/frontend` folder): `npm run dev -- --host`
4. Open **http://localhost:5173** (computer) or the `Network:` address (phone).

**To stop the app:** press **Ctrl + C** in each terminal window. In XAMPP you can click **Stop** next to MySQL.

**To get the latest version of the project** (if the author updates GitHub), in the `riverready` folder:

```
git pull
cd frontend
npm install
```

---

## Part 10: Install it as an app (PWA)

RiverReady is a **PWA (Progressive Web App)**, which means it can be installed to your home screen or desktop and opened like a normal app.

**Two things to know first:**
- Install only works with the **"production build"**, not with the `npm run dev` version from Part 7.
- Browsers only allow installing from a **secure (https) address** or from **`localhost`**. Your phone uses an `http://192.168…` address, so you need one extra step on Android (below).

### Step 1: Create and run the production build

In **Terminal 2** press **Ctrl + C** to stop the dev server, then run:

```
npm run build
npm run preview -- --host
```

Wait for `✓ built in …`. The preview prints `Local:` and `Network:` addresses again, but now on port **4173**, for example `http://192.168.1.23:4173`. **Terminal 1 (backend) must still be running.**

### Step 2a: Install on the computer (easiest)

1. In **Chrome** or **Edge**, open **http://localhost:4173**.
2. Look for the **install icon** (a small monitor with a down arrow) at the right end of the address bar. Or open the **⋮ menu** → **"Cast, save and share"** → **"Install page as app…"** (Edge: **⋯** → **Apps** → **Install this site as an app**).
3. Click **Install**. RiverReady opens in its own window and appears in your Start menu, Launchpad or app list.

### Step 2b: Install on an Android phone (Chrome)

Because the phone address is not `https`, tell Chrome to trust it once:

1. On the phone, open Chrome and type in the address bar: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Set the highlighted option to **Enabled**.
3. In the text box, type your preview address, e.g. `http://192.168.1.23:4173`
4. Tap **Relaunch** at the bottom.
5. Open `http://192.168.1.23:4173` (your address).
6. Tap **⋮ menu** → **"Install app"** (or **"Add to Home screen"** → **Install**).
7. The RiverReady icon appears on your home screen. Open it, and it runs full-screen without the browser bar.

> When you're finished testing, you can set that flag back to **Default**.

### Step 2c: iPhone (Safari)

1. Open the preview address (e.g. `http://192.168.1.23:4173`) in **Safari**.
2. Tap the **Share** button (square with an up arrow) → **"Add to Home Screen"** → **Add**.

The icon appears on your home screen and opens without the Safari bar. Full app features such as offline loading only work on the **https** (deployed) version of the site, because iPhones have no equivalent of the Android flag.

**To go back to normal development** afterwards, press Ctrl + C in Terminal 2 and run `npm run dev -- --host` again.

---

## Part 11: Test everything (checklist)

Work through this on the **computer** and then again on the **phone**. Tick each box. An internet connection is needed for live river data.

### A. Main features

| # | What to do | What should happen | ✓ |
|---|---|---|---|
| 1 | Open the app home page | **"My locations"** shows cards for the demo locations, each with a status (e.g. Normal / Elevated / High / No data) shown as **text and an icon**, not just colour | ☐ |
| 2 | Go to **"Find a station"** and type a river or town, e.g. `Thames`, `York` or `Severn` | After a short pause a list of matching stations appears. A loading indicator shows while waiting. | ☐ |
| 3 | Type nonsense, e.g. `zzzzqq` | A friendly **"No stations found for …"** message, not a crash | ☐ |
| 4 | Pick a station from the list | Its **latest reading** is shown (value, unit, time) with **"Source: Environment Agency"** | ☐ |
| 5 | Click **"Save as location"**, fill in a name (e.g. "My house"), and optionally town, notes and a risk note, then save | A **"Location saved."** message appears and you can open the new location | ☐ |
| 6 | Try saving with the **name empty** | The form refuses and highlights the field: **"Please fix the highlighted fields."** | ☐ |
| 7 | Open a saved location | You see **Saved details**, **Live readings** (big number, status, small trend line, "rising/falling/steady") and **Preparedness actions** | ☐ |
| 8 | Click **Edit** on the location, change the name, save | The new name shows on the detail page and on the home page | ☐ |
| 9 | In **Preparedness actions**, click **"Add suggested actions"** | A starter checklist is added (documents, supplies, etc.) | ☐ |
| 10 | Click **"Add action"**, enter a title, choose a category, priority and due date, then save | The new action appears in the list | ☐ |
| 11 | Tick an action as **Done** | It's marked done and the **progress bar** goes up | ☐ |
| 12 | **Edit** an action (change its title) and save | The change is shown | ☐ |
| 13 | **Delete** an action | A confirmation asks "Delete the action …?". After you confirm, it disappears. | ☐ |
| 14 | Refresh the page (F5, or pull down on the phone) | All your changes are still there (they're saved in the database) | ☐ |
| 15 | **Delete** the whole location | A confirmation warns it deletes the location *and all its actions*. After you confirm, it's gone from the home page. | ☐ |
| 16 | Check the bottom of every page | The disclaimer is always visible: *"Educational project. Not an official flood warning service and not safety advice…"* | ☐ |
| 17 | Click the **theme button** (sun/moon) | The app switches between light and dark mode | ☐ |

### B. Phone and layout

| # | What to do | What should happen | ✓ |
|---|---|---|---|
| 18 | Use the app on the phone in **portrait** and **landscape** | Everything fits the screen, nothing is cut off and there's no sideways scrolling | ☐ |
| 19 | Tap buttons, checkboxes and links | They're easy to hit with a finger | ☐ |
| 20 | On a computer, make the browser window very narrow, then wide | The layout adapts smoothly | ☐ |
| 21 | Install as an app (Part 10) and open it from the home screen or desktop | Opens in its own window with the RiverReady icon | ☐ |

### C. When things go wrong (the app should cope gracefully)

| # | What to do | What should happen | ✓ |
|---|---|---|---|
| 22 | **Simulate the Environment Agency being down:** stop Terminal 1 (Ctrl + C) and restart the backend with a fake address. **Windows:** run `set RIVERREADY_EA_BASE_URL=http://invalid.invalid`, then the usual backend command. **Mac/Linux:** `RIVERREADY_EA_BASE_URL=http://invalid.invalid php -S localhost:8000 -t backend/public backend/public/index.php`. Then open any saved location and try a station search. | The location page still shows **saved details and actions**, plus a **"Live data unavailable"** notice with **Retry**. Search shows an error message with Retry. Nothing crashes. | ☐ |
| 23 | Undo test 22: stop the backend (Ctrl + C), **close that terminal**, open a new one and start the backend normally (Part 7) | Live data comes back | ☐ |
| 24 | Stop the backend completely (Ctrl + C in Terminal 1) and click around the app | Clear error messages with **Retry** buttons appear, not blank screens. Start the backend again and click **Retry**: it recovers. | ☐ |
| 25 | Stop the database (XAMPP: Stop MySQL; Mac: `brew services stop mariadb`; Linux: `sudo systemctl stop mariadb`), then reload the app | A polite error, no technical details or passwords shown. Start the database again afterwards. | ☐ |

### D. Optional: test the API directly with Postman (for technical testers)

1. Install **Postman** from https://www.postman.com/downloads/.
2. Click **Import** and choose `backend/postman/riverready.postman_collection.json` from the project.
3. With the backend running (Terminal 1), open the collection and click **Run**. It covers valid, invalid and incomplete requests for every endpoint, using `http://localhost:8000`.

   (The "EA down" and "EA slow" folders expect extra backend copies on ports 8011 and 8012. You can skip those or see `backend/README.md`.)

---

## Part 12: Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `'git'` / `'node'` / `'npm'` is **not recognized** / **command not found** | The terminal was opened before installing | Close **all** terminals, open a new one and try again. If it still fails, restart the computer. |
| `'php' is not recognized` (Windows) | PHP comes with XAMPP and isn't on the system path | Use the full path `C:\xampp\php\php.exe` as shown in this guide |
| `npm.ps1 cannot be loaded because running scripts is disabled` | You're in **PowerShell** | Use **Command Prompt** (`cmd`) instead |
| `node` version is below 22, or `npm install` / `npm run dev` complains about the Node version | Old Node.js | Install the current **LTS** from nodejs.org (Mac: `brew upgrade node`, Linux: `nvm install 22`) |
| XAMPP MySQL **won't start** (turns red) | Another database program is already using port 3306 | Close other database programs (e.g. a separately installed MySQL), or restart the computer and try again |
| `ERROR 1007 database exists` / `ERROR 1396 Operation CREATE USER failed` | You already ran Part 5 before | That's fine, just continue with the next step |
| `Access denied for user 'riverready'@'localhost'` | Password in `config.php` doesn't match | Re-open `config.php` (Part 6) and check the password, quotes included. Or reset it as root: `ALTER USER 'riverready'@'localhost' IDENTIFIED BY 'new_password';` and put the new one in `config.php`. |
| `/api/health` shows **503**, or the app says it can't load locations | Database not running, or wrong config | Start MySQL (XAMPP), `brew services start mariadb` (Mac) or `sudo systemctl start mariadb` (Linux). Check `config.php`. |
| `Failed to open file 'backend/database/schema.sql'` | The database console was started from the wrong folder | `exit`, then `cd` into the project folder and try again |
| `Address already in use` / `Failed to listen on localhost:8000` | The backend is already running in another window (or another program uses port 8000) | Find and close the other terminal, or restart the computer |
| Vite says port 5173 is in use and picks **5174** | A previous dev server is still running | Fine to use the new number it prints, or close the old terminal |
| Website loads but **every list is empty or shows errors** | Backend (Terminal 1) isn't running | Start Terminal 1 (Part 7) and press **Retry** |
| Station search always fails / **"Live data unavailable"** everywhere | No internet on the computer, or the Environment Agency service is temporarily down | Check your internet. If the EA service is down, wait and retry. The rest of the app still works. |
| Phone shows "This site can't be reached" | Different Wi-Fi, firewall or network isolation | See the checklist in [Part 8](#part-8-open-it-on-your-phone) |
| Phone works with `npm run dev` but **no "Install app"** option | Install needs the production build and a secure address | Follow [Part 10](#part-10-install-it-as-an-app-pwa) exactly, including the Chrome flag |
| `npm install` fails with network errors | Internet or proxy problem | Check your internet and run `npm install` again |
| App looks old after an update | Browser cache or service worker | Hard refresh (Ctrl + Shift + R / Cmd + Shift + R). For an installed app, close and reopen it. |

Still stuck? Copy the **exact error message** from the terminal and send it to the project author along with which Part and step you were on.

---

## Part 13: Glossary

| Word | Meaning |
|---|---|
| **Terminal / Command Prompt** | A window where you type commands |
| **Git / clone** | Git downloads code; "cloning" is downloading a full copy of a GitHub project |
| **Repository (repo)** | The project folder on GitHub |
| **Node.js / npm** | Node runs JavaScript tools on your computer; npm downloads the building blocks (packages) the frontend needs |
| **PHP** | The programming language the backend is written in |
| **MariaDB / MySQL** | The database program that stores saved data (they're almost identical) |
| **XAMPP** | A free Windows bundle containing PHP and MariaDB |
| **Backend / server** | The behind-the-scenes part that stores data and talks to other services |
| **Frontend** | The part you see and click in the browser |
| **API** | The way the frontend asks the backend for data (addresses starting with `/api/…`) |
| **localhost** | "This computer". It only works on the computer running the app. |
| **Port** (e.g. `:5173`) | A numbered "door" on a computer; each running program uses its own |
| **Production build** | An optimised, final version of the website (`npm run build`) |
| **PWA** | Progressive Web App: a website you can install like an app |
| **Environment Agency (EA)** | The UK government body whose public river-level data the app displays |

---

*RiverReady is an educational project. It is not an official flood warning service and not safety advice. Always check the Environment Agency (gov.uk) for official flood information.*
