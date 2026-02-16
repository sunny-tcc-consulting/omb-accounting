import { z } from 'zod';

// Transaction validation schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.date({ required_error: '请选择日期' }),
  amount: z
    .number({ required_error: '请输入金额' })
    .min(0.01, '金额必须大于 0'),
  category: z.string({ required_error: '请选择分类' }),
  description: z.string({ required_error: '请输入描述' }).min(1, '描述不能为空').max(500, '描述不能超过 500 个字符'),
  reference: z.string().optional(),
  status: z.enum(['completed', 'pending', 'cancelled']).default('completed'),
});

// Category validation schema
export const categorySchema = z.object({
  name: z.string({ required_error: '请输入分类名称' }).min(1, '分类名称不能为空').max(50, '分类名称不能超过 50 个字符'),
  type: z.enum(['income', 'expense']),
  color: z.string({ required_error: '请选择颜色' }).default('#3b82f6'),
  icon: z.string({ required_error: '请选择图标' }).default('Circle'),
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string({ required_error: '请输入邮箱' })
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string({ required_error: '请输入密码' })
    .min(1, '密码不能为空')
    .min(6, '密码至少需要 6 个字符'),
});

// Register validation schema
export const registerSchema = z
  .object({
    name: z
      .string({ required_error: '请输入姓名' })
      .min(1, '姓名不能为空')
      .max(50, '姓名不能超过 50 个字符'),
    email: z
      .string({ required_error: '请输入邮箱' })
      .min(1, '邮箱不能为空')
      .email('请输入有效的邮箱地址'),
    password: z
      .string({ required_error: '请输入密码' })
      .min(1, '密码不能为空')
      .min(6, '密码至少需要 6 个字符'),
    confirmPassword: z
      .string({ required_error: '请确认密码' })
      .min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

// Transaction filters schema
export const transactionFiltersSchema = z.object({
  type: z.enum(['income', 'expense', 'all']).default('all'),
  category: z.string().optional(),
  dateRange: z
    .object({
      start: z.date().optional(),
      end: z.date().optional(),
    })
    .optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});

// Export options schema
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'excel']).default('csv'),
  includeHeaders: z.boolean().default(true),
});

// Date range schema
export const dateRangeSchema = z.object({
  start: z.date({ required_error: '请选择开始日期' }),
  end: z.date({ required_error: '请选择结束日期' }),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Type inference
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
