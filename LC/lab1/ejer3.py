# LC
# LAB - Sesion 1
# Jose Javier Calvo Moratilla
# Calcular la frecuencia de los todos los bigramas de la cadena, considerar un sÃ­mbolo
# inicial <S> y un sÃ­mbolo final </S> para la cadena

import operator

dic = {}

cadena = "El/DT perro/N come/V carne/N de/P la/DT carnicerÃ­a/N y/C de/P la/DT nevera/N y/C canta/V el/DT la/N la/N la/N ./Fp"

tokens = cadena.split()

#Proceso de llenado del diccionario con los binomios
for i in range(len(tokens) - 1):    
    if i==1:
      categoria1 = '<S>'
    else:
      categoria1 = tokens[i].split('/')[1] 
    if i == len(tokens) - 1:
      categoria2 = '</S>'
    else:
      categoria2 = tokens[i + 1].split('/')[1]   
    #Si no existe la clave la crea con su formato
    dic[(categoria1, categoria2)] = dic.get((categoria1, categoria2) , 0) + 1

#proceso de escritura del resultado
# Ordenado por nÃºmero de frecuencia
lista_ordenada = sorted(dic.items(), key=operator.itemgetter(1), reverse=True)
for binomio in enumerate(lista_ordenada):
    print(binomio[1][0], dic[binomio[1][0]])