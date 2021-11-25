# LC
# LAB - Sesion 1
# Jose Javier Calvo Moratilla
# Obtener un diccionario, que para cada categorÃ­a, muestre su frecuencia. Ordenar el
 # resultado alfabÃ©ticamente por categorÃ­a.

dic = {}

cadena = "El/DT perro/N come/V carne/N de/P la/DT carnicerÃ­a/N y/C de/P la/DT nevera/N y/C canta/V el/DT la/N la/N la/N ./Fp"

tokens = cadena.split()

for x in tokens:
  dic[x.split('/')[1]]  =  dic.get(x.split('/')[1], 0) + 1

[print(x, y) for (x,y) in sorted(dic.items())]