# LC
# LAB - Sesion 1
# Jose Javier Calvo Moratilla
# Obtener un diccionario, que para cada palabra, muestre su frecuencia, y una lista de
# sus categorÃ­as morfosintÃ¡cticas con su respectiva frecuencia. Mostrar el resultado
# ordenado alfabÃ©ticamente por palabra.

dic = {}

cadena = "El/DT perro/N come/V carne/N de/P la/DT carnicerÃ­a/N y/C de/P la/DT nevera/N y/C canta/V el/DT la/N la/N la/N ./Fp"

tokens = cadena.split()

for token in tokens:
    palabra = token.split('/')[0].lower()
    categoria = token.split('/')[1]
    
    #Si no existe la clave la crea con su formato
    dic[palabra] = dic.get(palabra, [0,{}])
    #Una vez se asegura que la clave existe incrementa la freq de la palabra
    dic[palabra][0] += 1    
    #Ahora ya vemos si la categoria existe, si no existe la introduce e incrementa la freq
    dic[palabra][1][categoria] = dic[palabra][1].get(categoria, 0) + 1    

#Escritura en la consola de los resultados 
res = ''
for (key,item) in sorted(dic.items()):
  freq_palabra = item[0]
  dict_cat = item[1]
  res += str(key) + ' ' + str(freq_palabra) + ' '
  for categoria, freq in dict_cat.items():
    res += str(categoria) + ' ' + str(freq) + ' '
  res += '\n'
print(res)