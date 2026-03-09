import { Component } from '@angular/core';
import { NavigationStart, Router, Event } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'golf-courses';
  url!: string;
  url1!: string;
  activeRoute!: string;
  active2Route!: string;
  hideFooter: boolean = false;
  showHeader: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        const url = event.url.split("/");
        this.url = url[1];
        this.url1 = url[2];
        this.activeRoute = this.url;
        this.active2Route = this.url1;

        const body = document.getElementsByTagName('body')[0];
        if (this.activeRoute === 'advisors-dashboard' ||
          this.active2Route === 'advisors-dashboard' ||
          this.activeRoute === 'batch' ||
          this.active2Route === 'batch' || this.activeRoute === 'categories' ||
          this.active2Route === 'categories'

        ) {
          this.showHeader = false;
        } else {
          this.showHeader = true;
        }
        if (this.active2Route === "chat-advisor" || this.active2Route === "map-grid" || this.active2Route === "map-list" || this.active2Route === "chat" || this.active2Route === "voice-call" || this.active2Route === "video-call" || this.activeRoute === 'advisors-dashboard' ||
          this.active2Route === 'advisors-dashboard' || this.activeRoute === 'batch' ||
          this.active2Route === 'batch' || this.activeRoute === 'categories' ||
          this.active2Route === 'categories') {
          this.hideFooter = true;
        } else {
          this.hideFooter = false;
        }
        if (this.activeRoute === "") {
          body.classList.add('home');
        } else {
          body.classList.remove('home');
        }

        if (this.active2Route === "advisors-register" || this.active2Route === "login" || this.active2Route === "register" || this.active2Route === "forgot-password") {
          body.classList.add('account-page');
        } else {
          body.classList.remove('account-page');
        }

        if (this.active2Route === "chat" || this.active2Route === "chat-advisor") {
          body.classList.add('chat-page');
        } else {
          body.classList.remove('chat-page');
        }
      }
    });
  }
}