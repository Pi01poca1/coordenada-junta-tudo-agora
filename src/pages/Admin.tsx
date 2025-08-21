import React from "react"
import BooksTable from "@/components/Admin/BooksTable"
import AdminStats from '@/components/Admin/AdminStats'
import UsersTable from "@/components/Admin/UsersTable"
import { Navigation } from "@/components/Layout/Navigation"

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Dashboard do Administrador
        </h1>

        <p className="text-muted-foreground mb-6">
          Aqui você tem uma visão geral dos usuários e livros cadastrados.
        </p>

        <AdminStats />
        <UsersTable />
        <BooksTable />
      </main>
    </div>
  )
}