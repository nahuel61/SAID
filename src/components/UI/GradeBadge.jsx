import React from 'react';
import { Shield, Star, ChevronUp, Award, Zap } from 'lucide-react';

/**
 * STANAG 2116 Grade Badge Component
 * Displays military grade with NATO code coloring and category icons.
 *
 * Categories:
 *  - OF-7 to OF-9: Oficial Superior (gold)
 *  - OF-3 to OF-6: Oficial Jefe (blue)
 *  - OF-1 to OF-2: Oficial Subalterno (teal)
 *  - OR-6 to OR-9: Suboficial Superior (purple)
 *  - OR-1 to OR-5: Suboficial Subalterno (slate)
 */

const getGradeConfig = (codigoOTAN, tipoGrado) => {
    if (!codigoOTAN) {
        return tipoGrado === 'Oficial'
            ? configs.oficialJefe
            : configs.suboficialSuperior;
    }

    const [prefix, num] = codigoOTAN.split('-');
    const rank = parseInt(num, 10);

    if (prefix === 'OF') {
        if (rank >= 7) return configs.oficialSuperior;
        if (rank >= 3) return configs.oficialJefe;
        return configs.oficialSubalterno;
    }
    if (prefix === 'OR') {
        if (rank >= 6) return configs.suboficialSuperior;
        return configs.suboficialSubalterno;
    }

    return configs.oficialJefe; // fallback
};

const configs = {
    oficialSuperior: {
        bg: 'bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-amber-800/20',
        border: 'border-amber-300 dark:border-amber-700',
        text: 'text-amber-800 dark:text-amber-300',
        code: 'text-amber-600/70 dark:text-amber-400/60',
        icon: Star,
        iconColor: 'text-amber-500',
        label: 'Oficial Superior'
    },
    oficialJefe: {
        bg: 'bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20',
        border: 'border-blue-300 dark:border-blue-700',
        text: 'text-blue-800 dark:text-blue-300',
        code: 'text-blue-600/70 dark:text-blue-400/60',
        icon: Shield,
        iconColor: 'text-blue-500',
        label: 'Oficial Jefe'
    },
    oficialSubalterno: {
        bg: 'bg-gradient-to-r from-teal-100 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/20',
        border: 'border-teal-300 dark:border-teal-700',
        text: 'text-teal-800 dark:text-teal-300',
        code: 'text-teal-600/70 dark:text-teal-400/60',
        icon: Award,
        iconColor: 'text-teal-500',
        label: 'Oficial Subalterno'
    },
    suboficialSuperior: {
        bg: 'bg-gradient-to-r from-purple-100 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/20',
        border: 'border-purple-300 dark:border-purple-700',
        text: 'text-purple-800 dark:text-purple-300',
        code: 'text-purple-600/70 dark:text-purple-400/60',
        icon: ChevronUp,
        iconColor: 'text-purple-500',
        label: 'Suboficial Superior'
    },
    suboficialSubalterno: {
        bg: 'bg-gradient-to-r from-slate-100 to-gray-50 dark:from-slate-800/40 dark:to-gray-800/30',
        border: 'border-slate-300 dark:border-slate-600',
        text: 'text-slate-700 dark:text-slate-300',
        code: 'text-slate-500/70 dark:text-slate-400/60',
        icon: Zap,
        iconColor: 'text-slate-500',
        label: 'Suboficial Subalterno'
    }
};

export const GradeBadge = ({ grado, abreviatura, codigoOTAN, tipoGrado, compact = false }) => {
    const config = getGradeConfig(codigoOTAN, tipoGrado);
    const Icon = config.icon;
    const displayName = compact ? (abreviatura || grado) : grado;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${config.bg} ${config.border} ${config.text} transition-all hover:shadow-sm`}
            title={`${grado} — ${codigoOTAN || tipoGrado} (${config.label})`}
        >
            <Icon size={compact ? 12 : 14} className={config.iconColor} strokeWidth={2.5} />
            <span className="truncate max-w-[120px]">{displayName}</span>
            {codigoOTAN && (
                <span className={`text-[10px] font-mono ${config.code}`}>
                    {codigoOTAN}
                </span>
            )}
        </span>
    );
};

export const GradeBadgeCompact = (props) => <GradeBadge {...props} compact={true} />;
