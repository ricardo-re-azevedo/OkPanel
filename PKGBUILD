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
  'sassc'
  'wireplumber'
  'bluez'
  'bluez-utils'
  'dart-sass'
  'upower'
  'brightnessctl'
)
source=(
  "okpanel"
  "ags/"
)
sha256sums=('SKIP' 'SKIP')

package() {
  cd "$srcdir/$pkgname-$pkgver"

  install -Dm755 okpanel "$pkgdir/usr/bin/okpanel"

  mkdir -p "$pkgdir/usr/share/OkPanel"
  rsync -a --exclude='girs' --exclude='node_modules' ags/ "$pkgdir/usr/share/OkPanel/"
}