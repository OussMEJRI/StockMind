import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchService, SearchResult } from '../../../core/services/search.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {
  searchControl = new FormControl('');
  searchResults: SearchResult[] = [];
  isSearching = false;
  showResults = false;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query && query.length >= 2) {
            this.isSearching = true;
            return this.searchService.search(query);
          }
          this.isSearching = false;
          return of([]);
        }),
        catchError(() => {
          this.isSearching = false;
          return of([]);
        })
      )
      .subscribe(results => {
        this.searchResults = results;
        this.isSearching = false;
        this.showResults = results.length > 0;
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchResults = [];
    this.showResults = false;
  }

  closeResults(): void {
    this.showResults = false;
  }
}
