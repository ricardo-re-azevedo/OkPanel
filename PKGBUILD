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
    'sassc'
)
source=("okpanel-$pkgver.tar.gz")  # generated with `makepkg --source`
sha256sums=('SKIP')  # or real hash

package() {
  cd "$srcdir/$pkgname-$pkgver"

  # Install everything from ./ags to /usr/share/OkPanel
  install -d "$pkgdir/usr/share/OkPanel"
  cp -r ags/* "$pkgdir/usr/share/OkPanel/"

  # Install launcher script
  install -Dm755 okpanel "$pkgdir/usr/bin/okpanel"
}