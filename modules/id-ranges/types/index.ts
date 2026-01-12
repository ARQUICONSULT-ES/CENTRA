export interface IdRange {
  from: number;
  to: number;
}

export interface ApplicationWithRanges {
  id: string;
  name: string;
  publisher: string;
  idRanges: IdRange[];
}

export interface ApiResponse {
  applications: ApplicationWithRanges[];
  minId: number;
  maxId: number;
}
