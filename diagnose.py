import os
import shutil
import subprocess
import sys

def check_binary(name):
    path = shutil.which(name)
    if path:
        return path
    
    # Check common local bin paths
    home = os.path.expanduser("~")
    common_paths = [
        os.path.join(home, ".local", "bin", name),
        os.path.join(home, "bin", name),
        f"/usr/local/bin/{name}"
    ]
    for p in common_paths:
        if os.path.exists(p):
            return p
    return None

def main():
    print("🔍 Monteeq Environment Diagnostic")
    print("-" * 30)
    
    binaries = ["uvicorn", "celery", "cargo", "python", "npm"]
    all_found = True
    
    for b in binaries:
        path = check_binary(b)
        if path:
            print(f"✅ {b.ljust(10)}: Found at {path}")
        else:
            print(f"❌ {b.ljust(10)}: NOT FOUND in PATH")
            all_found = False
            
    if not all_found:
        print("\n💡 Tips to fix missing dependencies:")
        if not check_binary("cargo"):
            print("👉 Install Rust/Cargo: sudo dnf install cargo")
        if not check_binary("uvicorn") or not check_binary("celery"):
            print("👉 Add local bins to PATH: export PATH=\"$HOME/.local/bin:$PATH\"")
            print("   (Then run: source ~/.bashrc)")
        
    # Check if backend requirements are met
    try:
        import sqlalchemy
        print("✅ SQLAlchemy  : Installed")
    except ImportError:
        print("❌ SQLAlchemy  : Missing (run pip install -r backend/requirements.txt)")

    print("-" * 30)
    if all_found:
        print("🚀 Everything looks good! Run 'npm run dev' to start.")
    else:
        print("⚠️ Some binaries are missing. Fix the PATH or install missing tools.")

if __name__ == "__main__":
    main()
