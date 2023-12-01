interface Issue {
  id: string;
  assignee_name: string;
  assignee_email: string;
  title: string;
  status: string;
}

export interface IssueFormData {
  title: string;
}
