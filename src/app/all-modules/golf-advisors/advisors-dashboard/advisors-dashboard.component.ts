import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-advisors-dashboard',
  templateUrl: './advisors-dashboard.component.html',
  styleUrls: ['./advisors-dashboard.component.css']
})
export class AdvisorsDashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  
}