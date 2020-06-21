export default class Sidebar {
  constructor (width, id, img) {
    this.Sidebar = document.getElementById(id);

    if (this.Sidebar == null || width < 30) {
      this.init = false;
      return;
    }
    this.init = true;

    this.Close = document.createElement('div');
    this.Close.id = 'close';
    const image = document.createElement('img');
    image.src = img;
    this.Close.appendChild(image);
    this.Sidebar.appendChild(this.Close);

    this.Header = document.createElement('h1');
    this.Header.id = 'info_header';
    this.Header.className = 'text';
    this.Text = document.createElement('p');
    this.Text.id = 'info_text';
    this.Text.className = 'text';
    this.Sidebar.appendChild(this.Header);
    this.Sidebar.appendChild(this.Text);

    this.Canvas = document.createElement('canvas');
    this.Canvas.width = (width - 10) + 'px';
    this.Canvas.height = Math.floor((width - 10) / 4 * 3) + 'px';
    this.Canvas.id = 'info_canvas';
    this.Sidebar.appendChild(this.Canvas);

    this.WTarget = 0;
    this.max = width;
    this.Sidebar.style.left = '-' + this.max + 'px';
    this.Sidebar.style.width = this.max + 'px';
    this.Sidebar.style.height = window.innerWidth + 'px';
    this.Close.style.marginLeft = this.max;

    this.Close.onclick = (ev) => {
      if (this.WTarget === 0) {
        this.WTarget = this.max;
        this.Sidebar.style.left = '0px';
      } else {
        this.WTarget = 0;
        this.Sidebar.style.left = '-' + this.max + 'px';
      }
    };

    window.addEventListener('resize', () => {
      this.Sidebar.style.height = window.innerWidth + 'px';
    }, false);
  }

  setText (text) {
    if (this.init) {
      this.Text.innerHTML = text;
    }
  }

  setHeader (text) {
    if (this.init) {
      this.Header.innerHTML = text;
    }
  }

  getCanvas () {
    if (this.init) {
      return this.Canvas;
    }
  }
}
