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

# Cleanup background processes on exit
BGPIDS=()
cleanup() {
  for pid in "${BGPIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

# Verify we're in the repo root
check_repo_root() {
  if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    error "Please run this script from the repository root directory."
    exit 1
  fi
}

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

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true
}

check_nvm() {
  load_nvm
  if command -v nvm &>/dev/null; then
    info "nvm $(nvm --version) found"
    return 0
  fi
  return 1
}

install_nvm() {
  if ! command -v curl &>/dev/null; then
    error "curl is required to install nvm. Please install curl first."
    exit 1
  fi

  info "Installing nvm..."
  curl -fsSo- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  load_nvm

  if ! command -v nvm &>/dev/null; then
    error "nvm installation failed. Please install manually: https://github.com/nvm-sh/nvm"
    exit 1
  fi
  info "nvm $(nvm --version) installed"
}

check_node() {
  if command -v node &>/dev/null; then
    local node_major
    node_major=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_major" -ge 24 ] 2>/dev/null; then
      info "Node.js $(node -v) found"
      return 0
    fi
    warn "Node.js $(node -v) found, but >= 24 is required"
  else
    warn "Node.js not found"
  fi
  return 1
}

install_node() {
  info "Installing latest Node.js via nvm..."
  # Temporarily relax set -e for nvm (shell function with internal non-zero exits)
  set +e
  if [ -f .nvmrc ]; then
    nvm install
  else
    nvm install node
  fi
  local nvm_exit=$?
  set -e

  if [ $nvm_exit -ne 0 ]; then
    error "nvm install failed (exit code $nvm_exit)"
    exit 1
  fi

  set +e
  nvm use
  set -e

  if ! command -v node &>/dev/null; then
    error "Node.js installation via nvm failed. node is not in PATH."
    exit 1
  fi

  info "Node.js $(node -v) installed via nvm"
}

check_pnpm() {
  if command -v pnpm &>/dev/null; then
    local pnpm_major
    pnpm_major=$(pnpm -v | cut -d. -f1)
    if [ "$pnpm_major" -ge 9 ] 2>/dev/null; then
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

check_docker() {
  if command -v docker &>/dev/null; then
    info "Docker found ($(docker --version))"
    return 0
  fi
  return 1
}

setup_env() {
  local service_dir="$1"
  if [ ! -f "$service_dir/.env" ]; then
    if [ -f "$service_dir/.env.example" ]; then
      cp "$service_dir/.env.example" "$service_dir/.env"
      info "Copied .env.example → .env in $service_dir/"
    else
      warn "No .env.example found in $service_dir/"
    fi
  else
    info ".env already exists in $service_dir/"
  fi
}

setup_docker() {
  if ! check_docker; then
    warn "Docker is not installed."
    read -rp "Install Docker? [y/n] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
      install_docker
    else
      warn "Docker is required for containerized services. Skipping Docker setup."
      return 1
    fi
  fi

  # Verify Docker daemon is running
  if ! docker info &>/dev/null; then
    warn "Docker daemon is not running. Please start Docker Desktop (macOS) or 'sudo systemctl start docker' (Linux)."
    return 1
  fi

  info "Docker daemon is running"
  return 0
}

setup_backend() {
  info "Setting up backend service..."

  setup_env "services/backend"

  info "Starting backend dev server..."
  pnpm --filter @gsoft/backend dev
}

setup_frontend() {
  info "Setting up frontend service..."

  setup_env "services/frontend"

  info "Starting frontend dev server..."
  pnpm --filter @gsoft/frontend dev
}

# --- Main ---

echo ""
echo "========================================="
echo "   GSoft Node.js Monorepo Setup"
echo "========================================="
echo ""

check_repo_root
detect_os

# Prompt for service selection
echo ""
echo "Which service would you like to run?"
PS3="Select an option: "
SERVICE=""
select choice in "Backend" "Frontend" "Both"; do
  case $REPLY in
    1) SERVICE="backend"; break ;;
    2) SERVICE="frontend"; break ;;
    3) SERVICE="both"; break ;;
    *) error "Invalid option. Please select 1, 2, or 3." ;;
  esac
done

if [ -z "$SERVICE" ]; then
  error "No service selected. Aborting."
  exit 1
fi
echo ""

# Check & install nvm
if ! check_nvm; then
  read -rp "nvm not found. Install nvm? [y/n] " answer
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    install_nvm
  else
    error "nvm is required to manage Node.js versions. Aborting."
    exit 1
  fi
fi

# Check & install Node.js via nvm
if ! check_node; then
  install_node
fi

# Check & install pnpm
if ! check_pnpm; then
  install_pnpm
fi

# Install dependencies
info "Installing dependencies..."
pnpm install

# Check Docker (needed for containerized services)
echo ""
DOCKER_OK=false
if setup_docker; then
  DOCKER_OK=true
fi

# Ask about optional workflow engine services (only if Docker is available)
if [ "$DOCKER_OK" = true ]; then
  echo ""
  echo "Optional workflow engine services:"
  PS3="Start a workflow engine? "
  WORKFLOW=""
  select wf_choice in "None" "Temporal" "Restate" "n8n" "Node-RED"; do
    case $REPLY in
      1) WORKFLOW=""; break ;;
      2) WORKFLOW="temporal"; break ;;
      3) WORKFLOW="restate"; break ;;
      4) WORKFLOW="n8n"; break ;;
      5) WORKFLOW="node-red"; break ;;
      *) error "Invalid option. Please select 1-5." ;;
    esac
  done

  if [ -n "$WORKFLOW" ]; then
    info "Starting $WORKFLOW..."
    docker compose -f "docker/docker-compose.${WORKFLOW}.yml" up -d
  fi
fi

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
    setup_backend &
    BGPIDS+=($!)
    setup_frontend
    ;;
esac
