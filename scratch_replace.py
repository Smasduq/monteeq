import sys

with open('/home/smasduq/montage/frontend/src/index.css', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith('.settings-wrapper {'):
        if start_idx == -1:
            start_idx = i
    if line.startswith('.modal-overlay {'):
        end_idx = i
        break

new_css = """/* --- Retro-Futuristic Neo-Cyber Settings Styling --- */
.settings-wrapper {
  display: flex;
  gap: 3.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem 10rem;
}

.settings-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: calc(var(--header-h) + 2rem);
  height: fit-content;
}

.settings-sidebar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.4rem;
  border-radius: 4px;
  color: #777;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-family: 'Space Mono', 'Courier New', monospace;
  border-left: 2px solid transparent;
}

.settings-sidebar-item:hover {
  background: #0a0a0a;
  color: #fff;
  border-left: 2px solid #555;
  transform: translateX(4px);
}

.settings-sidebar-item.active {
  background: #110000;
  color: #eb0000;
  border-left: 2px solid #eb0000;
  box-shadow: inset 20px 0 30px -20px #eb0000;
}

.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  min-width: 0;
}

.settings-card {
  padding: 2.5rem;
  background: #08080a;
  border: 1px solid #1a1a20;
  border-top: 1px solid #2a2a30;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}

.settings-card-title {
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-group-box {
  background: #08080a;
  border: 1px solid #1a1a20;
  border-radius: 8px;
  padding: 1.5rem 2.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.settings-group-box:hover {
  border-color: #333;
}

.settings-group-box.premium {
  border: 1px solid #eb0000;
  background: #0f0000;
  box-shadow: 0 0 20px rgba(235,0,0,0.1), inset 0 0 20px rgba(235,0,0,0.05);
}

.setting-tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.8rem 0;
  border-bottom: 1px solid #1a1a20;
}

.setting-tile:last-child {
  border-bottom: none;
}

.setting-tile-title {
  font-weight: 800;
  font-size: 1.1rem;
  color: white;
  letter-spacing: 0.5px;
}

.setting-tile-desc {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.4rem;
}

.setting-tile-action {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tile-btn-minimal {
  background: #111;
  border: 1px solid #333;
  color: #fff;
  padding: 0.8rem 1.6rem;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
}

.tile-btn-minimal:hover {
  background: #222;
  border-color: #555;
  box-shadow: 0 0 15px rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.settings-input {
  width: 100%;
  padding: 1.2rem;
  background: #050505;
  border: 1px solid #222;
  border-radius: 6px;
  color: #fff;
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.settings-input:focus {
  border-color: #eb0000;
  box-shadow: 0 0 15px rgba(235,0,0,0.3);
  background: #0a0a0a;
}

/* Toggle Switch Neo-Cyber */
.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #1a1a20;
  transition: .4s;
  border-radius: 34px;
  border: 1px solid #333;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px; width: 20px;
  left: 3px; bottom: 3px;
  background-color: #555;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #eb0000;
  border-color: #eb0000;
  box-shadow: 0 0 15px rgba(235,0,0,0.4);
}
input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background-color: #fff;
}

/* Floating Save Bar */
.floating-save-bar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 4rem);
  max-width: 1400px;
  background: #0a0a0c;
  padding: 1.5rem 3rem;
  border-radius: 8px;
  border: 1px solid #2a2a30;
  border-top: 1px solid #3a3a40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(235,0,0,0.1);
  animation: slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}

.save-btn {
  background: #eb0000;
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 4px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 0 20px rgba(235,0,0,0.4);
}

.save-btn:hover {
  background: #ff1a1a;
  box-shadow: 0 0 30px rgba(235,0,0,0.6);
  transform: translateY(-2px);
}
.save-btn:active { transform: translateY(0); }

@media (max-width: 900px) {
  .settings-wrapper {
    flex-direction: column;
    padding: 2rem 1rem 8rem;
    gap: 2rem;
  }
  .settings-sidebar {
    width: calc(100% + 2rem);
    margin: 0 -1rem;
    position: sticky;
    top: var(--header-h);
    flex-direction: row;
    overflow-x: auto;
    background: #050505;
    padding: 0.75rem 1rem;
    z-index: 100;
    border-bottom: 1px solid #1a1a20;
    border-top: 1px solid #1a1a20;
  }
  .settings-sidebar-item {
    flex-shrink: 0;
    padding: 0.8rem 1.4rem;
    font-size: 0.8rem;
    border-left: none;
    border-bottom: 2px solid transparent;
  }
  .settings-sidebar-item:hover {
    border-left: none;
    border-bottom: 2px solid #555;
    transform: none;
  }
  .settings-sidebar-item.active {
    border-left: none;
    border-bottom: 2px solid #eb0000;
    box-shadow: inset 0 -20px 30px -20px #eb0000;
  }
}
"""

lines[start_idx:end_idx] = [new_css + "\n"]

with open('/home/smasduq/montage/frontend/src/index.css', 'w') as f:
    f.writelines(lines)

