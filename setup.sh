#!/usr/bin/env bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

detect_os() {
  OS="$(uname -s)"
  DISTRO=""
  case "$OS" in
    Darwin) OS="macOS" ;;
    Linux)
      if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
          ubuntu|debian) DISTRO="debian" ;;
          fedora|rhel|centos) DISTRO="fedora" ;;
          arch|manjaro) DISTRO="arch" ;;
          *) DISTRO="$ID" ;;
        esac
      fi
      ;;
    *) error "Unsupported OS: $OS"; exit 1 ;;
  esac
  info "Detected OS: $OS${DISTRO:+ ($DISTRO)}"
}

check_node() {
  if command -v node &>/dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -ge 24 ]; then
      info "Node.js v$(node -v | sed 's/v//') found"
      return 0
    fi
    warn "Node.js $(node -v) found, but >= 24 is required"
  else
    warn "Node.js not found"
  fi
  return 1
}

install_node() {
  info "Installing Node.js >= 24..."
  if [ "$OS" = "macOS" ]; then
    brew install node
  elif [ "$DISTRO" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif [ "$DISTRO" = "fedora" ]; then
    curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
    sudo dnf install -y nodejs
  elif [ "$DISTRO" = "arch" ]; then
    sudo pacman -S --noconfirm nodejs
  else
    error "Cannot auto-install Node.js for distro '$DISTRO'. Please install Node.js >= 24 manually."
    exit 1
  fi
}

check_pnpm() {
  if command -v pnpm &>/dev/null; then
    PNPM_VERSION=$(pnpm -v | cut -d. -f1)
    if [ "$PNPM_VERSION" -ge 9 ]; then
      info "pnpm v$(pnpm -v) found"
      return 0
    fi
    warn "pnpm $(pnpm -v) found, but >= 9 is required"
  else
    warn "pnpm not found"
  fi
  return 1
}

install_pnpm() {
  info "Enabling pnpm via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
  info "pnpm v$(pnpm -v) installed"
}

install_docker() {
  info "Installing Docker..."
  if [ "$OS" = "macOS" ]; then
    brew install --cask docker
    info "Docker Desktop installed. Please open Docker Desktop to complete setup."
  elif [ "$DISTRO" = "debian" ]; then
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker "$USER"
    info "Docker installed. You may need to log out and back in for group changes to take effect."
  elif [ "$DISTRO" = "fedora" ]; then
    sudo dnf -y install dnf-plugins-core
    sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo usermod -aG docker "$USER"
    info "Docker installed. You may need to log out and back in for group changes to take effect."
  elif [ "$DISTRO" = "arch" ]; then
    sudo pacman -S --noconfirm docker docker-compose
    sudo systemctl start docker
    sudo usermod -aG docker "$USER"
    info "Docker installed. You may need to log out and back in for group changes to take effect."
  else
    error "Cannot auto-install Docker for distro '$DISTRO'. Please install Docker manually."
    exit 1
  fi
}

setup_backend() {
  info "Setting up backend service..."

  # Copy .env.example → .env if missing
  if [ ! -f services/backend/.env ]; then
    if [ -f services/backend/.env.example ]; then
      cp services/backend/.env.example services/backend/.env
      info "Copied .env.example → .env in services/backend/"
    else
      warn "No .env.example found in services/backend/"
    fi
  else
    info ".env already exists in services/backend/"
  fi

  # Check Docker
  if ! command -v docker &>/dev/null; then
    warn "Docker is not installed."
    read -rp "Install Docker? [y/n] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
      install_docker
    else
      error "Docker is required for the backend. Skipping Docker setup."
      return
    fi
  else
    info "Docker found"
  fi

  info "Starting backend with docker-compose..."
  docker compose -f services/backend/docker/docker-compose.yml -f services/backend/docker/docker-compose.dev.yml up
}

setup_frontend() {
  info "Setting up frontend service..."
  if [ ! -f services/frontend/.env ]; then
    if [ -f services/frontend/.env.example ]; then
      cp services/frontend/.env.example services/frontend/.env
      info "Copied .env.example → .env in services/frontend/"
    fi
  fi
  info "Starting frontend dev server..."
  pnpm --filter @gsoft/frontend dev
}

# --- Main ---

echo ""
echo "========================================="
echo "   GSoft Node.js Monorepo Setup"
echo "========================================="
echo ""

detect_os

# Prompt for service selection
echo ""
echo "Which service would you like to run?"
PS3="Select an option: "
select choice in "Backend" "Frontend" "Both"; do
  case $REPLY in
    1) SERVICE="backend"; break ;;
    2) SERVICE="frontend"; break ;;
    3) SERVICE="both"; break ;;
    *) error "Invalid option. Please select 1, 2, or 3." ;;
  esac
done
echo ""

# Check & install Node.js
if ! check_node; then
  read -rp "Install Node.js >= 24? [y/n] " answer
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    install_node
  else
    error "Node.js >= 24 is required. Aborting."
    exit 1
  fi
fi

# Check & install pnpm
if ! check_pnpm; then
  install_pnpm
fi

# Install dependencies
info "Installing dependencies..."
pnpm install

# Run selected service(s)
echo ""
case "$SERVICE" in
  backend)
    setup_backend
    ;;
  frontend)
    setup_frontend
    ;;
  both)
    setup_backend
    setup_frontend
    ;;
esac
