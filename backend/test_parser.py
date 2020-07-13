from parser import Parser, Sample
import unittest

class TestParser(unittest.TestCase):
    
    def test_sample_init(self):
        sample = Sample("Test", 1)

        self.assertEqual(sample.sensor_name, "Test")
        self.assertEqual(sample.sensor_id, 1)

    def test_sample_add_point_single(self):
        sample = Sample("Test", 1)

        sample.add_point(100, [1])

        self.assertEqual(sample.data[0], [1])
        self.assertEqual(sample.timestamps[0], 100)

    def test_sample_add_point_many(self):
        sample = Sample("Test", 1)

        for i in range(10):
            sample.add_point(i*10 , [i, -i])

        for i in range(10):
            self.assertEqual(sample.data[0][i], i)
            self.assertEqual(sample.data[1][i], -i)
            self.assertEqual(sample.timestamps[i], i*10)

    def test_sample_add_point_with_latency(self):
        sample = Sample("Test", 1)

        for i in range(50):
            sample.add_point(i, [i, -i, 10*i], 9*i)

        for i in range(50):
            self.assertEqual(sample.latencies[i], 9*i)

        


if __name__ == '__main__':
    unittest.main()