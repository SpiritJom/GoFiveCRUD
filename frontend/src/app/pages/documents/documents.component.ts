import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  searchTerm: string = ''; // Search term
  sortField: string = 'date'; // Default sort field
  sortDirection: string = 'asc'; // Default sort direction

  constructor() {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  // Mock data for documents
  loadDocuments(): void {
    this.documents = [
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' },
      { name: 'Lorem ipsum', date: 'April 9, 2022', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.' }
    ];
  }

  // Sorting function (mock implementation)
  sortDocuments(field: string): void {
    this.sortField = field;
    // Sorting logic can be added here
  }
}
