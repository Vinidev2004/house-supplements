"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react"
import type { Transaction } from "@/lib/types"
import { getTransactions, addTransaction, deleteTransaction, updateTransactionPaidStatus } from "@/lib/database"
import { TransactionForm } from "@/components/transaction-form"
import { formatCurrency } from "@/lib/utils"
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

export default function FinanceiroPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Transaction[]>([])
  const [monthFilter, setMonthFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  useEffect(() => {
    filterExpenses()
  }, [expenses, monthFilter, statusFilter])

  const loadExpenses = async () => {
    setIsLoading(true)
    const data = await getTransactions()
    setAllTransactions(data)
    const expensesOnly = data.filter((t) => t.type === "expense")
    setExpenses(expensesOnly.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setIsLoading(false)
  }

  const filterExpenses = () => {
    let filtered = expenses

    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        filtered = filtered.filter((e) => e.paid)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((e) => !e.paid)
      }
    }

    if (monthFilter !== "all") {
      filtered = filtered.filter((e) => {
        const expenseDate = new Date(e.date)
        const [year, month] = monthFilter.split("-")
        return (
          expenseDate.getFullYear() === Number.parseInt(year) && expenseDate.getMonth() + 1 === Number.parseInt(month)
        )
      })
    }

    setFilteredExpenses(filtered)
  }

  const getMonthOptions = () => {
    const months = new Set<string>()
    expenses.forEach((e) => {
      const date = new Date(e.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      months.add(monthKey)
    })
    return Array.from(months).sort().reverse()
  }

  const handleAddExpense = async (data: Omit<Transaction, "id">) => {
    const newExpense = await addTransaction(data)
    if (newExpense) {
      await loadExpenses()
      setIsDialogOpen(false)
      toast({
        title: "Gasto adicionado!",
        description: "O gasto foi registrado com sucesso.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao adicionar gasto",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    setExpenseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return

    const result = await deleteTransaction(expenseToDelete)
    if (result.success) {
      await loadExpenses()
      toast({
        title: "Gasto excluído!",
        description: "O gasto foi removido com sucesso.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao excluir gasto",
        description: result.error || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  const handleTogglePaid = async (id: string, currentPaid: boolean) => {
    const success = await updateTransactionPaidStatus(id, !currentPaid)
    if (success) {
      await loadExpenses()
      toast({
        title: currentPaid ? "Marcado como pendente" : "Marcado como pago",
        description: currentPaid ? "O gasto foi marcado como pendente." : "O gasto foi marcado como pago.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const totalRevenues = allTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalRevenues - totalExpenses
  const pendingExpenses = expenses.filter((e) => !e.paid).reduce((sum, e) => sum + e.amount, 0)
  const balance = totalRevenues - totalExpenses

  const getPaymentMethodLabel = (method?: string) => {
    const labels: Record<string, string> = {
      cash: "Dinheiro",
      credit: "Crédito",
      debit: "Débito",
      pix: "PIX",
    }
    return method ? labels[method] || method : "-"
  }

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  const isOverdue = (expense: Transaction) => {
    if (expense.paid || !expense.dueDate) return false
    return new Date(expense.dueDate) < new Date()
  }

  const getFinancialChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    return last30Days.map((date) => {
      const dayRevenues = allTransactions
        .filter((t) => t.type === "income" && t.date.startsWith(date))
        .reduce((sum, t) => sum + t.amount, 0)

      const dayExpenses = allTransactions
        .filter((t) => t.type === "expense" && t.date.startsWith(date))
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        receitas: dayRevenues,
        despesas: dayExpenses,
      }
    })
  }

  const financialChartData = getFinancialChartData()

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "hsl(142, 76%, 36%)",
    },
    despesas: {
      label: "Despesas",
      color: "hsl(0, 84%, 60%)",
    },
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando gastos...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gerenciamento Financeiro </h1>
          <p className="text-sm text-muted-foreground md:text-base">Controle suas finanças</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4 max-w-full">
        <Card className="max-w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-success break-words">
              {formatCurrency(totalRevenues)}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive break-words">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl sm:text-2xl font-bold break-words ${netProfit >= 0 ? "text-success" : "text-destructive"}`}
            >
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-500 break-words">
              {formatCurrency(pendingExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Lista de Gastos</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {filteredExpenses.length} gasto(s) encontrado(s)
                </CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Gasto
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-w-full">
          <div className="flex flex-col gap-3">
            {filteredExpenses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum gasto encontrado</p>
            ) : (
              filteredExpenses.map((expense) => (
                <Card key={expense.id} className="max-w-full overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{expense.category}</Badge>
                            <Badge
                              variant={expense.paid ? "outline" : isOverdue(expense) ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {expense.paid ? "Pago" : isOverdue(expense) ? "Vencido" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 break-words">{expense.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-lg font-bold whitespace-nowrap text-destructive">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                        {expense.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Criado: {new Date(expense.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                        {expense.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Vencimento: {new Date(expense.dueDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                        {expense.paymentMethod && (
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {getPaymentMethodLabel(expense.paymentMethod)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t pt-3">
                        <Button
                          variant={expense.paid ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleTogglePaid(expense.id, expense.paid || false)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {expense.paid ? "Desmarcar" : "Marcar Pago"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-full overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Gasto</DialogTitle>
            <DialogDescription>Registre um novo gasto no sistema</DialogDescription>
          </DialogHeader>
          <TransactionForm onSubmit={handleAddExpense} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
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
