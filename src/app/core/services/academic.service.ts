import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Faculty {
  faculty_id?: number;
  faculty_code: string;
  faculty_name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  total_programs?: number;
}

export interface Program {
  program_id?: number;
  program_code: string;
  program_name: string;
  faculty_id: number;
  faculty_code?: string;
  faculty_name?: string;
  degree: 'Associate' | 'Bachelor' | 'Master';
  duration_years: number;
  total_semesters: number;
  tuition_fee_per_semester?: number;
  total_tuition_fee?: number;
  semester_duration_months?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicYear {
  academic_year_id?: number;
  year_label: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface Semester {
  semester_id?: number;
  semester_name: string;
  semester_code: string;
}

export interface SubjectModel {
  subject_id?: number;
  subject_code: string;
  subject_name: string;
  credit: number;
  theory_hours: number;
  practical_hours: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Curriculum {
  curriculum_id?: number;
  program_id: number;
  program_code?: string;
  program_name?: string;
  faculty_code?: string;
  faculty_name?: string;
  academic_year_id: number;
  academic_year?: string;
  title: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  total_subjects?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  constructor(private api: ApiService) {}

  // Faculties
  getFaculties(params?: any): Observable<any> {
    return this.api.get('faculties', params);
  }
  getFaculty(id: number): Observable<any> {
    return this.api.get(`faculties/${id}`);
  }
  createFaculty(faculty: Faculty): Observable<any> {
    return this.api.post('faculties', faculty);
  }
  updateFaculty(id: number, faculty: Faculty): Observable<any> {
    return this.api.put(`faculties/${id}`, faculty);
  }
  deleteFaculty(id: number): Observable<any> {
    return this.api.delete(`faculties/${id}`);
  }

  // Programs
  getPrograms(params?: any): Observable<any> {
    return this.api.get('programs', params);
  }
  getProgram(id: number): Observable<any> {
    return this.api.get(`programs/${id}`);
  }
  createProgram(program: Program): Observable<any> {
    return this.api.post('programs', program);
  }
  updateProgram(id: number, program: Program): Observable<any> {
    return this.api.put(`programs/${id}`, program);
  }
  deleteProgram(id: number): Observable<any> {
    return this.api.delete(`programs/${id}`);
  }

  // Academic Years
  getAcademicYears(): Observable<any> {
    return this.api.get('academic-years');
  }
  createAcademicYear(year: AcademicYear): Observable<any> {
    return this.api.post('academic-years', year);
  }
  updateAcademicYear(id: number, year: AcademicYear): Observable<any> {
    return this.api.put(`academic-years/${id}`, year);
  }
  deleteAcademicYear(id: number): Observable<any> {
    return this.api.delete(`academic-years/${id}`);
  }

  // Semesters
  getSemesters(): Observable<any> {
    return this.api.get('semesters');
  }
  createSemester(semester: Semester): Observable<any> {
    return this.api.post('semesters', semester);
  }
  updateSemester(id: number, semester: Semester): Observable<any> {
    return this.api.put(`semesters/${id}`, semester);
  }
  deleteSemester(id: number): Observable<any> {
    return this.api.delete(`semesters/${id}`);
  }

  // Subjects
  getSubjects(params?: any): Observable<any> {
    return this.api.get('subjects', params);
  }
  createSubject(subject: SubjectModel): Observable<any> {
    return this.api.post('subjects', subject);
  }
  updateSubject(id: number, subject: SubjectModel): Observable<any> {
    return this.api.put(`subjects/${id}`, subject);
  }
  deleteSubject(id: number): Observable<any> {
    return this.api.delete(`subjects/${id}`);
  }

  // Curriculums
  getCurriculums(params?: any): Observable<any> {
    return this.api.get('curriculums', params);
  }
  getCurriculum(id: number): Observable<any> {
    return this.api.get(`curriculums/${id}`);
  }
  getCurriculumHierarchy(): Observable<any> {
    return this.api.get('curriculums/hierarchy');
  }
  createCurriculum(curriculum: Curriculum): Observable<any> {
    return this.api.post('curriculums', curriculum);
  }
  assignSubjects(curriculumId: number, semesterId: number, subjectIds: number[]): Observable<any> {
    return this.api.post(`curriculums/${curriculumId}/assign-subjects`, { semester_id: semesterId, subject_ids: subjectIds });
  }
  duplicateCurriculum(curriculumId: number): Observable<any> {
    return this.api.post(`curriculums/${curriculumId}/duplicate`, {});
  }
  copyToNewAcademicYear(curriculumId: number, targetYearId: number): Observable<any> {
    return this.api.post(`curriculums/${curriculumId}/copy-to-year`, { target_academic_year_id: targetYearId });
  }
  removeSubjectFromCurriculum(curriculumId: number, mappingId: number): Observable<any> {
    return this.api.delete(`curriculums/${curriculumId}/subjects/${mappingId}`);
  }
  deleteCurriculum(id: number): Observable<any> {
    return this.api.delete(`curriculums/${id}`);
  }
}
