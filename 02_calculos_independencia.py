import math
def years(annual_save, target, r):
    # FV annuity end of year
    if annual_save<=0: return float('inf')
    return math.log(1+target*r/annual_save)/math.log(1+r)
print("Solo salario mensual (12 pagos). Meta: ingreso pasivo = 50% del gasto")
print("s   | r=3%,w=3.5% | r=4%,w=4% | r=5%,w=4%")
for s in [0.05,0.10,0.15,0.20,0.25,0.30,0.40,0.50]:
    E=12*(1-s); row=[]
    for r,w in [(0.03,0.035),(0.04,0.04),(0.05,0.04)]:
        row.append(years(12*s,0.5*E/w,r))
    print(f"{int(s*100):>2}% | "+" | ".join(f"{y:5.1f}" for y in row))
print()
print("Empleado formal: ahorra s mensual + 100% de prima y cesantias (2 salarios/año)")
print("s   | tasa efectiva | r=3%,w=3.5% | r=4%,w=4% | r=5%,w=4%")
for s in [0.0,0.05,0.10,0.15,0.20,0.25,0.30]:
    E=12*(1-s); A=12*s+2; row=[]
    for r,w in [(0.03,0.035),(0.04,0.04),(0.05,0.04)]:
        row.append(years(A,0.5*E/w,r))
    print(f"{int(s*100):>2}% | {A/14*100:5.1f}% | "+" | ".join(f"{y:5.1f}" for y in row))
print()
# Caso deuda: hogar paga 27% en cuotas; al liquidar deuda redirige esa cuota sin cambiar consumo.
# Gasto de vida (sin deuda) = 73%-s0 ; ahorro = 27% + s0 + primas
print("Hogar que hoy destina 27% a cuotas: al terminar deudas redirige la cuota (consumo igual)")
for s0 in [0.0,0.05]:
    E=12*(0.73-s0); A=12*(0.27+s0)+2
    for r,w in [(0.04,0.04),(0.03,0.035)]:
        print(f"ahorro previo {int(s0*100)}% r={r} w={w}: {years(A,0.5*E/w,r):.1f} años (tasa efectiva {A/14*100:.0f}%)")
print()
print("Hitos (r=4%, w=4%) para empleado formal que ahorra s + primas y cesantias")
for s in [0.05,0.10,0.20]:
    E=12*(1-s); A=12*s+2
    print(f"s={int(s*100)}%: colchon 3 meses={3*(1-s)/ (A/12):.1f} meses de ahorro; " + ", ".join(f"IL {int(p*100)}%={years(A,p*E/0.04,0.04):.1f}a" for p in [0.10,0.25,0.50]))
