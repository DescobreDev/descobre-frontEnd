import { DataTable } from "../../components/dataTable";

export default function UsersList() {
  const columns = [
    { key: "name", title: "Nome" },
    { key: "email", title: "Email" }
  ];

  const data = [
    { id: 1, name: "João", email: "joao@email.com" },
    { id: 2, name: "Maria", email: "maria@email.com" }
  ];

  return <DataTable columns={columns} data={data} />;
}