"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search, User, Phone, Calendar } from 'lucide-react'
import type { Customer } from "@/lib/types"
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/lib/database"
import { CustomerForm } from "@/components/customer-form"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    setIsLoading(true)
    const data = await getCustomers()
    setCustomers(data)
    setFilteredCustomers(data)
    setIsLoading(false)
  }

  const handleAddCustomer = async (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    const newCustomer = await addCustomer(customerData)
    if (newCustomer) {
      await loadCustomers()
      setIsDialogOpen(false)
      toast({
        title: "Cliente adicionado!",
        description: `${customerData.name} foi adicionado com sucesso.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao adicionar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCustomer = async (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    if (!editingCustomer) return

    const updated = await updateCustomer(editingCustomer.id, customerData)
    if (updated) {
      await loadCustomers()
      setIsDialogOpen(false)
      setEditingCustomer(undefined)
      toast({
        title: "Cliente atualizado!",
        description: `${customerData.name} foi atualizado com sucesso.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    setCustomerToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return

    const result = await deleteCustomer(customerToDelete)
    if (result.success) {
      await loadCustomers()
      toast({
        title: "Cliente excluído!",
        description: "O cliente foi removido com sucesso.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao excluir cliente",
        description: result.error || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const openAddDialog = () => {
    setEditingCustomer(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const formatPhone = (phone: string) => {
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, "")
    
    // If starts with country code 55, remove it
    const localNumber = numbers.startsWith("55") ? numbers.slice(2) : numbers

    // Format as (99) 99999-9999
    if (localNumber.length === 11) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`
    }
    // Format as (99) 9999-9999 for 10 digits
    if (localNumber.length === 10) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`
    }
    // Return original if doesn't match expected length
    return phone
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando clientes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Clientes</h1>
          <p className="text-sm text-muted-foreground md:text-base">Gerencie seus clientes</p>
        </div>
        <Button onClick={openAddDialog} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Lista de Clientes</CardTitle>
          <CardDescription className="text-xs md:text-sm">{customers.length} cliente(s) cadastrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full">
                <p className="text-center text-sm text-muted-foreground py-8">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="max-w-full overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <User className="h-5 w-5 text-primary flex-shrink-0" />
                        <h3 className="font-semibold truncate">{customer.name}</h3>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatPhone(customer.phone)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs">Cadastrado em {formatDate(customer.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? "Atualize as informações do cliente" : "Preencha os dados do novo cliente"}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingCustomer(undefined)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
