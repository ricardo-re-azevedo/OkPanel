pkgname=OkPanel
pkgver=0.1.0
pkgrel=1
pkgdesc="A custom AGS panel that is OK"
arch=('any')
url="https://github.com/JohnOberhauser/OkPanel"
depends=(
  'aylurs-gtk-shell-git'
  'gvfs'
  'sox'
  'wf-recorder'
  'pipewire'
  'pipewire-pulse'
  'grim'
  'slurp'
  'networkmanager'
  'network-manager-applet'
  'wireplumber'
  'bluez'
  'bluez-utils'
  'dart-sass'
  'upower'
  'brightnessctl'
  'ttf-jetbrains-mono-nerd'
)
source=("$pkgname::git+$url#branch=main")
sha256sums=("SKIP")

package() {
  cd "${pkgname}"
  ls

  install -Dm755 bin/okpanel "$pkgdir/usr/bin/okpanel"
  install -Dm755 bin/okpanelShare "$pkgdir/usr/bin/okpanelShare"

  mkdir -p "$pkgdir/usr/share/OkPanel"
  rsync -a --exclude='@girs' --exclude='node_modules' ags/ "$pkgdir/usr/share/OkPanel/"
}