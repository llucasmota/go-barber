/**
 * Este arquivo foi criado para que a fila não
 * seja executada no mesmo processo do server
 */

import Queue from './lib/Queue';

Queue.processQueue();
